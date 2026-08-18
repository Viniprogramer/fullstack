# Stayly — Full Stack Booking Platform

Projeto de portfólio full stack inspirado em plataformas modernas de hospedagem.

## Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Lucide React
- CSS responsivo

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod

## Funcionalidades

- Landing page
- Busca e filtros de imóveis
- Página de detalhes
- Autenticação real via JWT
- Cadastro e login
- Favoritos
- Criação de reservas
- Regra de conflito de datas
- Histórico de reservas
- Dashboard do anfitrião
- CRUD de imóveis
- API REST
- PostgreSQL
- Seed de dados
- Checkout demonstrativo

## Rodando localmente

1. Crie um PostgreSQL e configure `server/.env` baseado em `.env.example`.
2. Instale:

```bash
npm install
```

3. Gere o Prisma Client:

```bash
npm run db:generate
```

4. Crie as tabelas:

```bash
npm run db:push
```

5. Popule os dados:

```bash
npm run seed
```

6. Rode frontend + backend:

```bash
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:4000

## Usuário demo

Email:
`demo@stayly.dev`

Senha:
`123456`

## Arquitetura

```text
React + TypeScript
        ↓
REST API
        ↓
Express + JWT
        ↓
Prisma ORM
        ↓
PostgreSQL
```

O frontend não acessa o banco diretamente.

## Deploy

Frontend pode ser hospedado na Vercel.
Backend pode ser hospedado em Render, Railway, Fly.io ou outro serviço Node.
PostgreSQL pode ser hospedado em Neon, Supabase ou Railway.

Configure no frontend:

`VITE_API_URL=https://sua-api.com/api`

E no backend:

`CLIENT_URL=https://seu-frontend.vercel.app`

