const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || "Request failed");
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: Record<string, unknown>) =>
    request<{ success: boolean; token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body,
    }),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body,
    }),

  me: (token: string) =>
    request<{ success: boolean; user: User }>("/api/auth/me", { token }),

  logout: () => request("/api/auth/logout", { method: "POST" }),

  googleLogin: (body: {
    idToken: string;
    role?: string;
    phone?: string;
    lga?: string;
    crops?: string[];
    irrigationStatus?: string;
    organization?: string;
  }) =>
    request<{ success: boolean; token: string; user: User }>("/api/auth/google", {
      method: "POST",
      body,
    }),

  // Users
  getUsers: (token: string, params?: string) =>
    request<{ success: boolean; data: User[] }>(`/api/users${params ? `?${params}` : ""}`, {
      token,
    }),

  updateProfile: (token: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: User }>("/api/users/me", {
      method: "PATCH",
      body,
      token,
    }),

  updateUser: (token: string, id: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: User }>(`/api/users/${id}`, {
      method: "PATCH",
      body,
      token,
    }),

  // Campaigns
  getCampaigns: (token: string) =>
    request<{ success: boolean; data: Campaign[] }>("/api/campaigns", { token }),

  createCampaign: (token: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: Campaign }>("/api/campaigns", {
      method: "POST",
      body,
      token,
    }),

  sendCampaign: (token: string, id: string) =>
    request<{ success: boolean; message: string; data: Campaign }>(
      `/api/campaigns/${id}/send`,
      { method: "POST", token }
    ),

  getCampaign: (token: string, id: string) =>
    request<{ success: boolean; data: Campaign }>(`/api/campaigns/${id}`, { token }),

  // Storage
  getFacilities: (params?: string) =>
    request<{ success: boolean; data: Facility[] }>(
      `/api/storage/facilities${params ? `?${params}` : ""}`
    ),

  getFacility: (id: string) =>
    request<{ success: boolean; data: Facility }>(`/api/storage/facilities/${id}`),

  createFacility: (token: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: Facility }>("/api/storage/facilities", {
      method: "POST",
      body,
      token,
    }),

  createBooking: (token: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: Booking }>("/api/storage/bookings", {
      method: "POST",
      body,
      token,
    }),

  myBookings: (token: string) =>
    request<{ success: boolean; data: Booking[] }>("/api/storage/bookings/me", { token }),

  operatorBookings: (token: string) =>
    request<{ success: boolean; data: Booking[] }>("/api/storage/bookings/operator", {
      token,
    }),

  // Produce
  getProduce: (params?: string) =>
    request<{ success: boolean; data: Produce[] }>(
      `/api/produce${params ? `?${params}` : ""}`
    ),

  createProduce: (token: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: Produce }>("/api/produce", {
      method: "POST",
      body,
      token,
    }),

  myProduce: (token: string) =>
    request<{ success: boolean; data: Produce[] }>("/api/produce/me", { token }),

  updateProduce: (token: string, id: string, body: Record<string, unknown>) =>
    request<{ success: boolean; data: Produce }>(`/api/produce/${id}`, {
      method: "PATCH",
      body,
      token,
    }),

  // Analytics
  getDashboard: (token: string) =>
    request<{ success: boolean; data: DashboardStats }>("/api/analytics/dashboard", {
      token,
    }),
};

// Types
export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  lga?: string;
  crops?: string[];
  irrigationStatus?: string;
  organization?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  message: string;
  channel: "sms" | "whatsapp" | "both";
  targetLgas?: string[];
  targetCrops?: string[];
  targetIrrigation?: string;
  status: string;
  totalRecipients: number;
  delivered: number;
  failed: number;
  sentAt?: string;
  createdAt: string;
  createdBy?: { name: string; email: string };
}

export interface Facility {
  _id: string;
  name: string;
  description?: string;
  type: string;
  lga: string;
  address?: string;
  totalCapacityKg: number;
  availableCapacityKg: number;
  pricePerKgPerDay: number;
  features?: string[];
  operator?: { name: string; organization?: string; phone?: string };
}

export interface Booking {
  _id: string;
  facility: Facility | string;
  farmer?: User;
  quantityKg: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalCost: number;
  cropType?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface Produce {
  _id: string;
  crop: string;
  quantityKg: number;
  unitPrice?: number;
  quality: string;
  lga?: string;
  status: string;
  farmer?: User;
  contactPhone?: string;
  description?: string;
  createdAt: string;
}

export interface DashboardStats {
  overview: {
    totalFarmers: number;
    totalOfficers: number;
    totalCampaigns: number;
    messagesSent: number;
    totalFacilities: number;
    activeBookings: number;
    availableProduce: number;
  };
  farmersByLga: { _id: string; count: number }[];
  farmersByIrrigation: { _id: string; count: number }[];
}
