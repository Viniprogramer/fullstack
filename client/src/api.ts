const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("stayly_token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Não foi possível concluir a operação.");
  return data;
}

export type Property = {
  id: string; title: string; city: string; state: string; country: string;
  price: number; guests: number; bedrooms: number; beds: number;
  rating: number; reviews: number; image: string; category: string;
  description: string; host: { id: string; name: string; avatar: string };
};

export type Booking = {
  id: string; checkIn: string; checkOut: string; guests: number;
  total: number; status: string; property: Property;
};

export const api = {
  properties: (params = "") => request<Property[]>(`/properties${params}`),
  property: (id: string) => request<Property>(`/properties/${id}`),
  register: (body: object) => request<{token:string;user:User}>("/auth/register",{method:"POST",body:JSON.stringify(body)}),
  login: (body: object) => request<{token:string;user:User}>("/auth/login",{method:"POST",body:JSON.stringify(body)}),
  me: () => request<User>("/auth/me"),
  favorites: () => request<Property[]>("/favorites"),
  toggleFavorite: (id:string) => request<{favorite:boolean}>(`/favorites/${id}`,{method:"POST"}),
  bookings: () => request<Booking[]>("/bookings"),
  createBooking: (body: object) => request<Booking>("/bookings",{method:"POST",body:JSON.stringify(body)}),
  cancelBooking: (id:string) => request<Booking>(`/bookings/${id}/cancel`,{method:"PATCH"}),
  hostProperties: () => request<Property[]>("/host/properties"),
  createProperty: (body: object) => request<Property>("/host/properties",{method:"POST",body:JSON.stringify(body)}),
  deleteProperty: (id:string) => request<void>(`/host/properties/${id}`,{method:"DELETE"})
};

export type User = {id:string;name:string;email:string;role:string;avatar:string};
