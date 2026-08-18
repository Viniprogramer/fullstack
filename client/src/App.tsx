import { useEffect, useState, createContext, useContext } from "react";
import { Routes, Route, Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Search, Heart, Menu, X, Star, MapPin, ChevronRight, CalendarDays,
  Users, ShieldCheck, ArrowRight, Home, Plus, LogOut, Building2,
  CalendarCheck, Trash2, CheckCircle2, AlertCircle, SlidersHorizontal
} from "lucide-react";
import { api, type Property, type User as UserType, type Booking } from "./api";

const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1000&q=85`;

const images = [
  img("photo-1505693416388-ac5ce068fe85"),
  img("photo-1600607687920-4e2a09cf159d"),
  img("photo-1600566753190-17f0baa2a6c3"),
  img("photo-1500534623283-312aade485b7"),
  img("photo-1494526585095-c41746248156"),
  img("photo-1522708323590-d24dbb6b0267"),
];

type AuthCtx = {
  user: UserType | null;
  setUser: (u: UserType | null) => void;
};

const AuthContext = createContext<AuthCtx>({ user: null, setUser: () => {} });
const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <Splash />;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="*" element={<Site />} />
      </Routes>
    </AuthContext.Provider>
  );
}

function Splash() {
  return (
    <div className="splash">
      <div className="mark">S</div>
      <b>stayly</b>
    </div>
  );
}

function Site() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/imovel/:id" element={<PropertyPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/cadastro" element={<AuthPage mode="register" />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/reservas" element={<Bookings />} />
        <Route path="/host" element={<Host />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function Header() {
  const { user, setUser } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem("stayly_token");
    setUser(null);
    setUserOpen(false);
    setMobileOpen(false);
    nav("/");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="header">
        <Link className="brand" to="/" onClick={closeMobile}>
          <span>S</span>stayly
        </Link>

        <nav className="top-nav">
          <NavLink to="/explorar">Explorar</NavLink>
          <a href="/#sobre">Sobre</a>
          <a href="/#ajuda">Ajuda</a>
        </nav>

        <div className="header-actions">
          <Link to="/favoritos" className="head-link desktop-favorite">
            <Heart /> Favoritos
          </Link>

          {user ? (
            <div className="user-menu desktop-user-menu">
              <button onClick={() => setUserOpen((v) => !v)} aria-expanded={userOpen}>
                <img src={user.avatar} alt={user.name} />
                <span>{user.name.split(" ")[0]}</span>
                <Menu />
              </button>

              {userOpen && (
                <div className="dropdown">
                  <Link to="/reservas" onClick={() => setUserOpen(false)}>
                    <CalendarCheck /> Minhas reservas
                  </Link>
                  <Link to="/host" onClick={() => setUserOpen(false)}>
                    <Building2 /> Painel do anfitrião
                  </Link>
                  <button onClick={logout}>
                    <LogOut /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="host-link desktop-login" to="/login">
              Entrar
            </Link>
          )}

          <button
            className="mobile-toggle"
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Menu de navegação">
          <nav className="mobile-menu-nav">
            <NavLink to="/explorar" onClick={closeMobile}>
              Explorar
            </NavLink>
            <a href="/#sobre" onClick={closeMobile}>
              Sobre
            </a>
            <a href="/#ajuda" onClick={closeMobile}>
              Ajuda
            </a>

            <Link to="/favoritos" onClick={closeMobile}>
              <Heart /> Favoritos
            </Link>

            {user ? (
              <>
                <div className="mobile-user-card">
                  <img src={user.avatar} alt={user.name} />
                  <div>
                    <strong>{user.name}</strong>
                    <small>Conta Stayly</small>
                  </div>
                </div>

                <Link to="/reservas" onClick={closeMobile}>
                  <CalendarCheck /> Minhas reservas
                </Link>

                <Link to="/host" onClick={closeMobile}>
                  <Building2 /> Painel do anfitrião
                </Link>

                <button type="button" onClick={logout}>
                  <LogOut /> Sair
                </button>
              </>
            ) : (
              <Link className="mobile-login" to="/login" onClick={closeMobile}>
                Entrar
                <ChevronRight />
              </Link>
            )}
          </nav>
        </div>
      )}

      <style>{`
        .mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          padding: 0;
          border: 1px solid rgba(20, 20, 20, .12);
          border-radius: 12px;
          background: #fff;
          color: #181818;
          cursor: pointer;
        }

        .mobile-toggle svg {
          width: 21px;
          height: 21px;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 760px) {
          .header {
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .top-nav,
          .desktop-favorite,
          .desktop-user-menu,
          .desktop-login {
            display: none !important;
          }

          .header-actions {
            margin-left: auto;
            gap: 8px;
          }

          .mobile-toggle {
            display: inline-flex !important;
          }

          .mobile-menu {
            display: block;
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            z-index: 999;
            max-height: calc(100vh - 72px);
            overflow-y: auto;
            padding: 12px 16px 24px;
            background: rgba(255, 255, 255, .98);
            border-bottom: 1px solid rgba(20, 20, 20, .08);
            box-shadow: 0 18px 40px rgba(0, 0, 0, .12);
            backdrop-filter: blur(16px);
          }

          .mobile-menu-nav {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .mobile-menu-nav > a,
          .mobile-menu-nav > button {
            width: 100%;
            min-height: 52px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 14px;
            border: 0;
            border-radius: 12px;
            background: transparent;
            color: #202020;
            text-decoration: none;
            font: inherit;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
          }

          .mobile-menu-nav > a:hover,
          .mobile-menu-nav > button:hover {
            background: #f5f3ef;
          }

          .mobile-menu-nav svg {
            width: 19px;
            height: 19px;
            flex: 0 0 auto;
          }

          .mobile-user-card {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 8px 0;
            padding: 14px;
            border-radius: 14px;
            background: #f7f5f1;
          }

          .mobile-user-card img {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            object-fit: cover;
          }

          .mobile-user-card div {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .mobile-user-card strong {
            font-size: 14px;
          }

          .mobile-user-card small {
            color: #777;
            font-size: 12px;
          }

          .mobile-login {
            justify-content: space-between !important;
            margin-top: 6px;
            background: #181818 !important;
            color: #fff !important;
          }

          .mobile-login svg {
            margin-left: auto;
          }
        }

        @media (min-width: 761px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

function HomePage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [props, setProps] = useState<Property[]>([]);

  useEffect(() => {
    api.properties().then(setProps).catch(() => setProps([]));
  }, []);

  function search(e: React.FormEvent) {
    e.preventDefault();
    nav(`/explorar${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <span className="eyebrow">ESTADIAS QUE VOCÊ VAI LEMBRAR</span>
          <h1>
            Seu próximo lugar
            <br />
            <i>começa aqui.</i>
          </h1>
          <p>
            Casas, apartamentos e refúgios únicos para viver o destino do seu jeito.
          </p>

          <form className="search-box" onSubmit={search}>
            <div>
              <MapPin />
              <label>Onde?</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cidade ou destino"
              />
            </div>
            <div>
              <CalendarDays />
              <label>Quando?</label>
              <span>Escolha as datas</span>
            </div>
            <div>
              <Users />
              <label>Hóspedes</label>
              <span>2 hóspedes</span>
            </div>
            <button>
              <Search /> Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="kicker">ESCOLHA SEU ESTILO</span>
            <h2>Encontre o lugar certo.</h2>
          </div>
          <Link to="/explorar">
            Ver todos <ArrowRight />
          </Link>
        </div>

        <div className="categories">
          {["Praia", "Montanha", "Design", "Cabana", "Cidade"].map((x, i) => (
            <button key={x} onClick={() => nav(`/explorar?category=${x}`)}>
              <img src={images[i]} alt={x} />
              <b>{x}</b>
              <small>Explorar estadias</small>
            </button>
          ))}
        </div>
      </section>

      <section className="section light">
        <div className="section-head">
          <div>
            <span className="kicker">MAIS PROCURADOS</span>
            <h2>Fique em lugares especiais.</h2>
            <p>Selecionados para uma experiência memorável.</p>
          </div>
          <Link to="/explorar">
            Explorar <ArrowRight />
          </Link>
        </div>

        <div className="property-grid">
          {props.slice(0, 6).map((p, i) => (
            <PropertyCard
              key={p.id}
              property={{ ...p, image: p.image || images[i % images.length] }}
            />
          ))}
        </div>
      </section>

      <section className="host-banner" id="sobre">
        <div>
          <span className="kicker">PARA ANFITRIÕES</span>
          <h2>
            Seu espaço pode
            <br />
            <i>ser o próximo favorito.</i>
          </h2>
          <p>
            Publique seu imóvel, receba hóspedes e acompanhe tudo em um só lugar.
          </p>
          <Link to="/host">
            Começar a hospedar <ArrowRight />
          </Link>
        </div>
        <img src={images[4]} alt="Imóvel Stayly" />
      </section>
    </main>
  );
}

function Explore() {
  const [props, setProps] = useState<Property[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") || "");
    setCategory(params.get("category") || "");
    api
      .properties(window.location.search)
      .then(setProps)
      .catch(() => setProps([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = props.filter(
    (p) =>
      (p.title + p.city + p.state).toLowerCase().includes(q.toLowerCase()) &&
      (!category || p.category === category)
  );

  return (
    <main className="page">
      <div className="explore-head">
        <div>
          <span className="kicker">EXPLORE</span>
          <h1>Encontre seu próximo destino.</h1>
          <p>{filtered.length} lugares disponíveis</p>
        </div>
        <button className="filter-btn">
          <SlidersHorizontal /> Filtros
        </button>
      </div>

      <div className="explore-search">
        <Search />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque cidade, região ou imóvel..."
        />
        <button
          onClick={() => {
            setLoading(true);
            api
              .properties(`?q=${encodeURIComponent(q)}`)
              .then(setProps)
              .finally(() => setLoading(false));
          }}
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando estadias...</div>
      ) : filtered.length ? (
        <div className="property-grid">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <Empty
          title="Nenhum imóvel encontrado"
          text="Tente outro destino ou remova alguns filtros."
        />
      )}
    </main>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  async function favorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setBusy(true);
    try {
      const r = await api.toggleFavorite(property.id);
      setFav(r.favorite);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link className="property-card" to={`/imovel/${property.id}`}>
      <div className="image-wrap">
        <img src={property.image} alt={property.title} />
        <button
          onClick={favorite}
          disabled={busy}
          className={fav ? "liked" : ""}
          aria-label="Favoritar imóvel"
        >
          {fav ? <Heart fill="currentColor" /> : <Heart />}
        </button>
        <span className="category">{property.category}</span>
      </div>

      <div className="property-info">
        <div className="line">
          <b>{property.title}</b>
          <span>
            <Star fill="currentColor" />
            {property.rating.toFixed(1)}
          </span>
        </div>
        <p>
          <MapPin />
          {property.city}, {property.state}
        </p>
        <div className="line price">
          <span>
            A partir de <strong>{money(property.price)}</strong> / noite
          </span>
          <small>{property.reviews} avaliações</small>
        </div>
      </div>
    </Link>
  );
}

function PropertyPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState<Property | null>(null);
  const [dates, setDates] = useState({ in: "", out: "" });
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) api.property(id).then(setP).catch(() => {});
  }, [id]);

  if (!p)
    return (
      <main className="page">
        {id ? <div className="loading">Carregando imóvel...</div> : <NotFound />}
      </main>
    );

  async function book() {
    setError("");

    if (!user) {
      nav("/login");
      return;
    }

    if (!dates.in || !dates.out) {
      setError("Escolha as datas de entrada e saída.");
      return;
    }

    try {
      await api.createBooking({
        propertyId: p.id,
        checkIn: dates.in,
        checkOut: dates.out,
        guests,
      });
      nav("/reservas");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const nights =
    dates.in && dates.out
      ? Math.max(
          1,
          Math.ceil(
            (new Date(dates.out).getTime() - new Date(dates.in).getTime()) /
              86400000
          )
        )
      : 0;

  return (
    <main className="page property-page">
      <Link className="back" to="/explorar">
        ← Voltar para explorar
      </Link>

      <div className="gallery">
        <img src={p.image} alt={p.title} />
        <img src={images[2]} alt="" />
        <img src={images[3]} alt="" />
        <img src={images[4]} alt="" />
      </div>

      <div className="property-layout">
        <article>
          <div className="property-title">
            <div>
              <span className="kicker">{p.category}</span>
              <h1>{p.title}</h1>
              <p>
                <MapPin />
                {p.city}, {p.state}, {p.country}
              </p>
            </div>
            <button className="circle">
              <Heart />
            </button>
          </div>

          <div className="facts">
            <span>
              <Users /> {p.guests} hóspedes
            </span>
            <span>
              <Home /> {p.bedrooms} quartos
            </span>
            <span>
              <Star fill="currentColor" /> {p.rating} · {p.reviews} avaliações
            </span>
          </div>

          <hr />

          <div className="host">
            <img src={p.host.avatar} alt={p.host.name} />
            <div>
              <b>Hospedado por {p.host.name}</b>
              <small>Anfitrião verificado · 4 anos hospedando</small>
            </div>
            <ShieldCheck />
          </div>

          <p className="description">{p.description}</p>

          <div className="amenities">
            <h2>O que este lugar oferece</h2>
            <div>
              <span>Wi-Fi rápido</span>
              <span>Cozinha completa</span>
              <span>Ar-condicionado</span>
              <span>Estacionamento</span>
            </div>
          </div>
        </article>

        <aside className="booking-card">
          <div className="booking-price">
            <b>{money(p.price)}</b>
            <span> / noite</span>
          </div>

          <div className="date-grid">
            <label>
              CHECK-IN
              <input
                type="date"
                value={dates.in}
                onChange={(e) => setDates({ ...dates, in: e.target.value })}
              />
            </label>
            <label>
              CHECK-OUT
              <input
                type="date"
                value={dates.out}
                onChange={(e) => setDates({ ...dates, out: e.target.value })}
              />
            </label>
          </div>

          <label className="guest-select">
            HÓSPEDES
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          {nights > 0 && (
            <div className="calc">
              <span>
                {money(p.price)} × {nights} noites
              </span>
              <b>{money(p.price * nights)}</b>
              <span>Taxa de serviço</span>
              <b>{money(p.price * nights * 0.08)}</b>
              <hr />
              <strong>Total</strong>
              <strong>{money(p.price * nights * 1.08)}</strong>
            </div>
          )}

          {error && (
            <div className="error">
              <AlertCircle /> {error}
            </div>
          )}

          <button className="reserve" onClick={book}>
            Reservar
          </button>
          <small className="no-charge">Você não será cobrado ainda</small>
        </aside>
      </div>
    </main>
  );
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "demo@stayly.dev",
    password: "123456",
  });
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const r =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);

      localStorage.setItem("stayly_token", r.token);
      setUser(r.user);
      nav("/");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <span className="eyebrow">STAYLY</span>
        <h1>
          Viaje mais.
          <br />
          <i>Planeje menos.</i>
        </h1>
        <p>
          Uma experiência completa para encontrar, reservar e gerenciar suas
          próximas estadias.
        </p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <Link to="/" className="brand dark">
          <span>S</span>stayly
        </Link>

        <h2>{mode === "login" ? "Bem-vindo de volta." : "Crie sua conta."}</h2>
        <p>
          {mode === "login"
            ? "Entre para continuar sua jornada."
            : "Comece a descobrir lugares incríveis."}
        </p>

        {mode === "register" && (
          <Field
            label="Nome"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
        )}

        <Field
          label="E-mail"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />

        <Field
          label="Senha"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          type="password"
        />

        {error && <div className="error">{error}</div>}

        <button className="reserve">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <small className="switch-auth">
          {mode === "login" ? "Ainda não tem conta? " : "Já tem uma conta? "}
          <Link to={mode === "login" ? "/cadastro" : "/login"}>
            {mode === "login" ? "Criar agora" : "Entrar"}
          </Link>
        </small>

        {mode === "login" && (
          <div className="demo-login">
            Demo: <b>demo@stayly.dev</b> · <b>123456</b>
          </div>
        )}
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Favorites() {
  const { user } = useAuth();
  const [p, setP] = useState<Property[]>([]);

  useEffect(() => {
    if (user) api.favorites().then(setP).catch(() => {});
  }, [user]);

  if (!user)
    return (
      <main className="page">
        <Empty
          title="Entre para ver seus favoritos"
          text="Salve lugares especiais e encontre tudo depois."
          action="/login"
        />
      </main>
    );

  return (
    <main className="page">
      <div className="explore-head">
        <div>
          <span className="kicker">SUA COLEÇÃO</span>
          <h1>Favoritos</h1>
          <p>{p.length} lugares salvos</p>
        </div>
      </div>

      {p.length ? (
        <div className="property-grid">
          {p.map((x) => (
            <PropertyCard key={x.id} property={x} />
          ))}
        </div>
      ) : (
        <Empty
          title="Você ainda não salvou nenhum lugar"
          text="Clique no coração dos imóveis que você gostar."
        />
      )}
    </main>
  );
}

function Bookings() {
  const { user } = useAuth();
  const [b, setB] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) api.bookings().then(setB).finally(() => setLoading(false));
    else setLoading(false);
  }, [user]);

  if (!user)
    return (
      <main className="page">
        <Empty
          title="Faça login para acessar suas reservas"
          text="Suas viagens aparecerão aqui."
          action="/login"
        />
      </main>
    );

  return (
    <main className="page">
      <div className="explore-head">
        <div>
          <span className="kicker">SUAS VIAGENS</span>
          <h1>Minhas reservas</h1>
          <p>Acompanhe suas próximas estadias.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando reservas...</div>
      ) : b.length ? (
        <div className="booking-list">
          {b.map((x) => (
            <div className="booking-row" key={x.id}>
              <img src={x.property.image} alt={x.property.title} />
              <div>
                <span className="kicker">{x.status}</span>
                <h3>{x.property.title}</h3>
                <p>
                  <MapPin />
                  {x.property.city}, {x.property.state}
                </p>
                <small>
                  {new Date(x.checkIn).toLocaleDateString("pt-BR")} →{" "}
                  {new Date(x.checkOut).toLocaleDateString("pt-BR")} ·{" "}
                  {x.guests} hóspedes
                </small>
              </div>
              <strong>{money(x.total)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="Você ainda não tem reservas"
          text="Encontre um lugar especial para sua próxima viagem."
          action="/explorar"
        />
      )}
    </main>
  );
}

function Host() {
  const { user } = useAuth();
  const [p, setP] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (user) api.hostProperties().then(setP).catch(() => {});
  }, [user]);

  if (!user)
    return (
      <main className="page">
        <Empty
          title="Entre para acessar o painel"
          text="Anfitriões gerenciam imóveis e reservas por aqui."
          action="/login"
        />
      </main>
    );

  async function remove(id: string) {
    await api.deleteProperty(id);
    setP((current) => current.filter((x) => x.id !== id));
    setToast("Imóvel removido");
    setTimeout(() => setToast(""), 1800);
  }

  return (
    <main className="page">
      <div className="dashboard-title">
        <div>
          <span className="kicker">ANFITRIÃO</span>
          <h1>Seu espaço.</h1>
          <p>Gerencie seus imóveis e acompanhe sua operação.</p>
        </div>

        <button className="reserve small-btn" onClick={() => setOpen(true)}>
          <Plus /> Novo imóvel
        </button>
      </div>

      <div className="host-stats">
        <div>
          <small>Receita este mês</small>
          <b>R$ 12.840</b>
          <span>+18,4%</span>
        </div>
        <div>
          <small>Reservas</small>
          <b>24</b>
          <span>+9,2%</span>
        </div>
        <div>
          <small>Ocupação</small>
          <b>78%</b>
          <span>+6,1%</span>
        </div>
        <div>
          <small>Avaliação</small>
          <b>4,9</b>
          <span>Excelente</span>
        </div>
      </div>

      <div className="host-section">
        <div className="section-head">
          <div>
            <span className="kicker">SEUS IMÓVEIS</span>
            <h2>Propriedades</h2>
          </div>
        </div>

        <div className="host-property-grid">
          {p.map((x) => (
            <div className="host-property" key={x.id}>
              <img src={x.image} alt={x.title} />
              <div>
                <b>{x.title}</b>
                <small>
                  {x.city}, {x.state}
                </small>
                <span>{money(x.price)} / noite</span>
              </div>
              <button onClick={() => remove(x.id)} aria-label="Excluir imóvel">
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <HostModal
          onClose={() => setOpen(false)}
          onDone={(property) => {
            setP((current) => [property, ...current]);
            setOpen(false);
          }}
        />
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 /> {toast}
        </div>
      )}
    </main>
  );
}

function HostModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (p: Property) => void;
}) {
  const [f, setF] = useState({
    title: "",
    city: "",
    state: "",
    price: "",
    category: "Design",
    description: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const p = await api.createProperty({
        ...f,
        price: Number(f.price),
        guests: 4,
        bedrooms: 2,
        beds: 2,
        image: images[0],
      });
      onDone(p);
    } catch {}
  }

  return (
    <div className="modal-bg" onMouseDown={onClose}>
      <form
        className="modal"
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Novo imóvel</h2>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>

        <Field
          label="Título"
          value={f.title}
          onChange={(v) => setF({ ...f, title: v })}
        />

        <div className="two-fields">
          <Field
            label="Cidade"
            value={f.city}
            onChange={(v) => setF({ ...f, city: v })}
          />
          <Field
            label="Estado"
            value={f.state}
            onChange={(v) => setF({ ...f, state: v })}
          />
        </div>

        <Field
          label="Preço por noite"
          value={f.price}
          onChange={(v) => setF({ ...f, price: v })}
          type="number"
        />

        <Field
          label="Descrição"
          value={f.description}
          onChange={(v) => setF({ ...f, description: v })}
        />

        <button className="reserve">Publicar imóvel</button>
      </form>
    </div>
  );
}

function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <div>
        <span>⌂</span>
        <h2>{title}</h2>
        <p>{text}</p>
        {action && (
          <Link className="reserve" to={action}>
            Continuar
          </Link>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <main className="page">
      <Empty
        title="Página não encontrada"
        text="O endereço que você acessou não existe."
        action="/"
      />
    </main>
  );
}

function Footer() {
  return (
    <footer id="ajuda">
      <div>
        <Link className="brand" to="/">
          <span>S</span>stayly
        </Link>
        <p>Experiências únicas, lugares especiais.</p>
      </div>

      <div>
        <b>Explorar</b>
        <Link to="/explorar">Destinos</Link>
        <Link to="/favoritos">Favoritos</Link>
        <Link to="/reservas">Viagens</Link>
      </div>

      <div>
        <b>Para anfitriões</b>
        <Link to="/host">Hospede seu espaço</Link>
        <a href="/#sobre">Como funciona</a>
      </div>

      <div>
        <b>Stayly</b>
        <a href="/#sobre">Sobre</a>
        <a href="/#ajuda">Ajuda</a>
      </div>

      <small>© 2026 Stayly. Projeto demonstrativo de portfólio.</small>
    </footer>
  );
}

export default App;