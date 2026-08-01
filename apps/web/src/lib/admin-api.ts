// Cliente HTTP separado de lib/api.ts (auth de tenant) - usa os mesmos
// principios (fetch + credentials:'include' + envelope {success,data,error})
// mas aponta pras rotas /admin/* e depende dos cookies admin_accessToken/
// admin_refreshToken, nunca dos cookies de tenant.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  });

  const json: AdminApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Erro na requisicao');
  }

  return json.data as T;
}

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
}

export interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string | null;
  type: string;
  status: string;
  createdAt: string;
  _count: { users: number; clients: number; appointments: number };
}

export interface BusinessDetail extends BusinessSummary {
  address: string | null;
  city: string | null;
  state: string | null;
  users: Array<{ id: string; name: string; email: string | null; role: string; isActive: boolean }>;
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminRequest<{ admin: PlatformAdmin }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => adminRequest('/admin/auth/logout', { method: 'POST' }),
  me: () => adminRequest<PlatformAdmin>('/admin/auth/me'),
  listBusinesses: () => adminRequest<BusinessSummary[]>('/admin/businesses'),
  getBusiness: (id: string) => adminRequest<BusinessDetail>(`/admin/businesses/${id}`),
};
