import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT || 4000);
const SECRET = process.env.JWT_SECRET || "stayly-dev-secret";

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

type ReqUser = { id: string; role: string };
type AuthedRequest = express.Request & { user?: ReqUser };

function sign(user: ReqUser) {
  return jwt.sign(user, SECRET, { expiresIn: "7d" });
}

function auth(
  req: AuthedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Autenticação necessária." });
  }

  try {
    req.user = jwt.verify(token, SECRET) as ReqUser;
    next();
  } catch {
    return res.status(401).json({ message: "Sessão expirada." });
  }
}

const userOut = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
});

const propertyInclude = {
  host: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
};

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "stayly-api" })
);

app.post("/api/auth/register", async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(req.body);

    const exists = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (exists) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const password = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        ...body,
        password,
        avatar: "https://i.pravatar.cc/150?img=12",
      },
    });

    res.status(201).json({
      token: sign({ id: user.id, role: user.role }),
      user: userOut(user),
    });
  } catch {
    res.status(400).json({ message: "Dados de cadastro inválidos." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (
      !user ||
      !(await bcrypt.compare(body.password, user.password))
    ) {
      return res
        .status(401)
        .json({ message: "E-mail ou senha inválidos." });
    }

    res.json({
      token: sign({ id: user.id, role: user.role }),
      user: userOut(user),
    });
  } catch {
    res.status(400).json({ message: "Dados de login inválidos." });
  }
});

app.get("/api/auth/me", auth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    return res.status(401).json({ message: "Usuário não encontrado." });
  }

  res.json(userOut(user));
});

app.get("/api/properties", async (req, res) => {
  const q = String(req.query.q || "");
  const category = String(req.query.category || "");

  const properties = await prisma.property.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
                { state: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });

  res.json(properties);
});

app.get("/api/properties/:id", async (req, res) => {
  const id = String(req.params.id);

  const p = await prisma.property.findUnique({
    where: { id },
    include: propertyInclude,
  });

  if (!p) {
    return res.status(404).json({ message: "Imóvel não encontrado." });
  }

  res.json(p);
});

app.get("/api/favorites", auth, async (req: AuthedRequest, res) => {
  const f = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    include: {
      property: {
        include: propertyInclude,
      },
    },
  });

  res.json(f.map((x) => x.property));
});

app.post("/api/favorites/:id", auth, async (req: AuthedRequest, res) => {
  const id = String(req.params.id);

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    return res.status(404).json({ message: "Imóvel não encontrado." });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId: req.user!.id,
        propertyId: id,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });

    return res.json({ favorite: false });
  }

  await prisma.favorite.create({
    data: {
      userId: req.user!.id,
      propertyId: id,
    },
  });

  res.json({ favorite: true });
});

app.get("/api/bookings", auth, async (req: AuthedRequest, res) => {
  const b = await prisma.booking.findMany({
    where: { userId: req.user!.id },
    include: {
      property: {
        include: propertyInclude,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(b);
});

app.post("/api/bookings", auth, async (req: AuthedRequest, res) => {
  try {
    const body = z
      .object({
        propertyId: z.string(),
        checkIn: z.string(),
        checkOut: z.string(),
        guests: z.number().int().min(1),
      })
      .parse(req.body);

    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (checkOut <= checkIn) {
      return res
        .status(400)
        .json({ message: "A saída deve ser depois da entrada." });
    }

    const property = await prisma.property.findUnique({
      where: { id: body.propertyId },
    });

    if (!property) {
      return res.status(404).json({ message: "Imóvel não encontrado." });
    }

    if (body.guests > property.guests) {
      return res.status(400).json({
        message: `Este imóvel comporta no máximo ${property.guests} hóspedes.`,
      });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        propertyId: body.propertyId,
        status: "CONFIRMED",
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: "Este imóvel já está reservado para essas datas." });
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / 86400000
    );

    const total = property.price * nights * 1.08;

    const booking = await prisma.booking.create({
      data: {
        propertyId: body.propertyId,
        userId: req.user!.id,
        checkIn,
        checkOut,
        guests: body.guests,
        total,
      },
      include: {
        property: {
          include: propertyInclude,
        },
      },
    });

    res.status(201).json(booking);
  } catch {
    res.status(400).json({ message: "Dados da reserva inválidos." });
  }
});

app.patch("/api/bookings/:id/cancel", auth, async (req: AuthedRequest, res) => {
  const id = String(req.params.id);

  const b = await prisma.booking.updateMany({
    where: {
      id,
      userId: req.user!.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  if (!b.count) {
    return res.status(404).json({ message: "Reserva não encontrada." });
  }

  res.json({ ok: true });
});

app.get("/api/host/properties", auth, async (req: AuthedRequest, res) => {
  const p = await prisma.property.findMany({
    where: { hostId: req.user!.id },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });

  res.json(p);
});

app.post("/api/host/properties", auth, async (req: AuthedRequest, res) => {
  try {
    const body = z
      .object({
        title: z.string().min(3),
        city: z.string().min(2),
        state: z.string().min(2),
        price: z.number().positive(),
        guests: z.number().int().positive(),
        bedrooms: z.number().int().positive(),
        beds: z.number().int().positive(),
        image: z.string().url(),
        category: z.string(),
        description: z.string().min(10),
      })
      .parse(req.body);

    const p = await prisma.property.create({
      data: {
        ...body,
        hostId: req.user!.id,
      },
      include: propertyInclude,
    });

    res.status(201).json(p);
  } catch {
    res.status(400).json({ message: "Dados do imóvel inválidos." });
  }
});

app.delete("/api/host/properties/:id", auth, async (req: AuthedRequest, res) => {
  const id = String(req.params.id);

  const p = await prisma.property.findFirst({
    where: {
      id,
      hostId: req.user!.id,
    },
  });

  if (!p) {
    return res.status(404).json({ message: "Imóvel não encontrado." });
  }

  await prisma.property.delete({
    where: { id: p.id },
  });

  res.status(204).send();
});

app.use((_req, res) =>
  res.status(404).json({ message: "Rota não encontrada." })
);

app.use((err: any, _req: any, res: express.Response, _next: any) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno da API." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Stayly API running on port ${PORT}`);
});