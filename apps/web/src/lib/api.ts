const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: Pagination;
  error?: {
    code: string;
    message: string;
  };
}

async function rawRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Erro na requisicao');
  }

  return json;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const json = await rawRequest<T>(endpoint, options);
  return json.data as T;
}

async function requestPaginated<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; pagination: Pagination }> {
  const json = await rawRequest<T>(endpoint, options);
  return { data: json.data as T, pagination: json.pagination as Pagination };
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  getPaginated: <T>(endpoint: string) => requestPaginated<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// WhatsApp API
export interface WhatsAppStatus {
  connected: boolean;
  state: string;
  connectedAt: string | null;
}

export interface WhatsAppConnectResult {
  instanceName: string;
  qrcode: string;
  status: string;
}

export const whatsappApi = {
  connect: (businessId: string) =>
    api.post<WhatsAppConnectResult>('/whatsapp/connect', { businessId }),

  getStatus: (businessId: string) =>
    api.get<WhatsAppStatus>(`/whatsapp/status/${businessId}`),

  getQRCode: (businessId: string) =>
    api.get<{ qrcode: string }>(`/whatsapp/qrcode/${businessId}`),

  disconnect: (businessId: string) =>
    api.post<{ message: string }>(`/whatsapp/disconnect/${businessId}`),
};

// Analytics API
export interface DashboardStats {
  today: {
    appointments: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    revenue: number;
  };
  week: {
    appointments: number;
    newClients: number;
    revenue: number;
  };
  month: {
    appointments: number;
    newClients: number;
    revenue: number;
    topServices: Array<{ name: string; count: number }>;
  };
  confirmationRate: number;
  averageTicket: number;
}

export interface RevenueReport {
  daily: Array<{ date: string; revenue: number; count: number }>;
}

export interface ServiceReport {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface ProfessionalReport {
  id: string;
  name: string;
  appointments: number;
  revenue: number;
}

export interface RetentionReport {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  newThisMonth: number;
  retentionRate: number;
}

export const analyticsApi = {
  getDashboard: () => api.get<DashboardStats>('/analytics/dashboard'),

  getRevenueReport: (startDate: string, endDate: string) =>
    api.get<RevenueReport>(`/analytics/reports/revenue?startDate=${startDate}&endDate=${endDate}`),

  getServiceReport: (startDate: string, endDate: string) =>
    api.get<ServiceReport[]>(`/analytics/reports/services?startDate=${startDate}&endDate=${endDate}`),

  getProfessionalReport: (startDate: string, endDate: string) =>
    api.get<ProfessionalReport[]>(`/analytics/reports/professionals?startDate=${startDate}&endDate=${endDate}`),

  getRetention: () => api.get<RetentionReport>('/analytics/reports/retention'),

  sendBirthdayMessages: () =>
    api.post<{ sentCount: number }>('/analytics/campaigns/birthday'),

  sendReactivationCampaign: (inactiveDays?: number) =>
    api.post<{ sentCount: number }>('/analytics/campaigns/reactivation', { inactiveDays }),
};

// Messages/Notifications API
export interface MessageStats {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface NotificationSummary {
  todayReminders: number;
  todayConfirmations: number;
  pendingMessages: number;
  recentMessages: Array<{
    id: string;
    clientName: string;
    content: string;
    status: string;
    createdAt: string;
  }>;
}

// ============================================
// Auth API
// ============================================
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'OWNER' | 'ADMIN' | 'PROFESSIONAL' | 'RECEPTIONIST';
  isActive: boolean;
  lastLoginAt?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  whatsappConnected: boolean;
  settings?: Record<string, unknown>;
}

export interface AuthResponse {
  user: User;
  business: Business;
}

export const authApi = {
  requestOTP: (phone: string) =>
    api.post<{ message: string; expiresIn: number }>('/auth/otp/request', { phone }),

  verifyOTP: (phone: string, otp: string) =>
    api.post<AuthResponse>('/auth/otp/verify', { phone, otp }),

  // O accessToken/refreshToken agora vivem em cookies httpOnly; o refresh
  // usa o cookie automaticamente (envio via credentials: 'include'), sem
  // precisar de nenhum token no corpo.
  refreshToken: () => api.post<{ expiresIn: number }>('/auth/refresh'),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  me: () => api.get<{ user: User; business: Business }>('/auth/me'),
};

// ============================================
// Inventory/Stock API
// ============================================
export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: 'INTERNAL_USE' | 'FOR_SALE' | 'BOTH';
  costPrice: number;
  salePrice?: number;
  currentStock: number;
  minStock: number;
  unit: string;
  expirationDate?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'PURCHASE' | 'SERVICE_USE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'LOSS' | 'EXPIRED';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  notes?: string;
  createdAt: string;
  product?: { name: string; unit: string };
  user?: { name: string };
}

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  monthlyPurchases: number;
  monthlyUsage: number;
  topConsumed: Array<{ product: Product; quantity: number }>;
}

export interface LowStockAlert {
  lowStock: Product[];
  expiringSoon: Product[];
}

export const inventoryApi = {
  // Products
  getProducts: (params?: { category?: string; lowStock?: boolean; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.lowStock) query.append('lowStock', 'true');
    if (params?.search) query.append('search', params.search);
    return api.get<Product[]>(`/inventory/products?${query}`);
  },

  getProduct: (id: string) => api.get<Product>(`/inventory/products/${id}`),

  createProduct: (data: Partial<Product> & { initialStock?: number }) =>
    api.post<Product>('/inventory/products', data),

  updateProduct: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/inventory/products/${id}`, data),

  // Stock Movements
  createMovement: (productId: string, data: { type: string; quantity: number; unitCost?: number; notes?: string; appointmentId?: string }) =>
    api.post<{ movement: StockMovement; product: Product }>(`/inventory/products/${productId}/movement`, data),

  getMovements: (params?: { productId?: string; type?: string; startDate?: string; endDate?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.productId) query.append('productId', params.productId);
    if (params?.type) query.append('type', params.type);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', params.limit.toString());
    return api.get<StockMovement[]>(`/inventory/movements?${query}`);
  },

  // Stats & Alerts
  getStats: () => api.get<InventoryStats>('/inventory/stats'),

  getAlerts: () => api.get<LowStockAlert>('/inventory/alerts/low-stock'),

  // Service-Product linking
  linkToService: (productId: string, serviceId: string, quantityUsed: number) =>
    api.post(`/inventory/products/${productId}/services/${serviceId}`, { quantityUsed }),

  unlinkFromService: (productId: string, serviceId: string) =>
    api.delete(`/inventory/products/${productId}/services/${serviceId}`),
};

// ============================================
// Finance API
// ============================================
export interface FinancialSummary {
  totalRevenue: number;
  totalCommissions: number;
  businessProfit: number;
  transactionCount: number;
  averageTicket: number;
}

export interface PaymentMethodStats {
  method: string;
  total: number;
  count: number;
}

export interface Commission {
  id: string;
  professionalId: string;
  professionalName: string;
  amount: number;
  appointmentCount: number;
  status: 'PENDING' | 'PAID';
}

export interface Payment {
  id: string;
  appointmentId?: string;
  amount: number;
  tip?: number;
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';
  status: string;
  createdAt: string;
  client?: { name: string };
  professional?: { name: string };
  service?: { name: string };
}

export interface CommissionConfig {
  id: string;
  professionalId?: string;
  serviceId?: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  professional?: { name: string };
  service?: { name: string };
}

export interface CommissionEntry {
  id: string;
  paymentId: string;
  professionalId: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

export interface CommissionPayout {
  id: string;
  professionalId: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paidAt?: string;
  notes?: string;
  createdAt: string;
  professional?: { name: string };
  entries?: CommissionEntry[];
}

export interface FinancialReport {
  period: { start: string; end: string };
  summary: {
    totalRevenue: number;
    totalCommissions: number;
    businessProfit: number;
    transactionCount: number;
    averageTicket: number;
  };
  byMethod: Array<{ method: string; total: number; count: number }>;
  byService: Array<{ serviceId: string; serviceName: string; total: number; count: number }>;
  byProfessional: Array<{ professionalId: string; professionalName: string; total: number; count: number; commission: number }>;
}

export interface CashRegister {
  isOpen: boolean;
  openedAt?: string;
  transactions: Payment[];
  totals: {
    total: number;
    byMethod: Record<string, number>;
  };
}

export interface CashRegisterClose {
  id: string;
  date: string;
  totalRevenue: number;
  totalByMethod: Record<string, number>;
  closedBy: string;
  notes?: string;
}

export const financeApi = {
  // Summary & Stats (used by financeiro page)
  getSummary: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<FinancialSummary>(`/finance/summary?${query}`);
  },

  getByMethod: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<PaymentMethodStats[]>(`/finance/by-method?${query}`);
  },

  getCommissions: (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    return api.get<Commission[]>(`/finance/commissions?${query}`);
  },

  payCommission: (commissionId: string) =>
    api.post<Commission>(`/finance/commissions/${commissionId}/pay`),

  closeCash: () =>
    api.post<CashRegisterClose>('/finance/cash-register/close'),

  // Payments
  getPayments: (params?: { startDate?: string; endDate?: string; method?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.method) query.append('method', params.method);
    return api.get<Payment[]>(`/finance/payments?${query}`);
  },

  registerPayment: (data: { clientId?: string; clientName: string; amount: number; method: string; description?: string; appointmentId?: string }) =>
    api.post<Payment>('/finance/payments', data),

  // Report
  getReport: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<FinancialReport>(`/finance/report?${query}`);
  },

  // Commission Configs
  getCommissionConfigs: () => api.get<CommissionConfig[]>('/finance/commissions/configs'),

  setCommissionConfig: (data: { professionalId?: string; serviceId?: string; type: string; value: number }) =>
    api.post<CommissionConfig>('/finance/commissions/configs', data),

  deleteCommissionConfig: (id: string) => api.delete(`/finance/commissions/configs/${id}`),

  // Pending Commissions
  getPendingCommissions: () =>
    api.get<Array<{ professionalId: string; professionalName: string; totalPending: number; count: number }>>('/finance/commissions/pending'),

  getProfessionalPending: (professionalId: string) =>
    api.get<CommissionEntry[]>(`/finance/commissions/pending/${professionalId}`),

  // Payouts
  getPayouts: (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    return api.get<CommissionPayout[]>(`/finance/commissions/payouts?${query}`);
  },

  getPayoutDetails: (id: string) => api.get<CommissionPayout>(`/finance/commissions/payouts/${id}`),

  createPayout: (data: { professionalId: string; commissionIds: string[]; notes?: string }) =>
    api.post<CommissionPayout>('/finance/commissions/payouts', data),

  markPayoutPaid: (id: string) => api.post<CommissionPayout>(`/finance/commissions/payouts/${id}/pay`),

  cancelPayout: (id: string) => api.delete(`/finance/commissions/payouts/${id}`),

  // Professional summary
  getProfessionalSummary: (professionalId: string) =>
    api.get<{ totalEarned: number; totalPending: number; lastPayout?: CommissionPayout }>(`/finance/commissions/summary/${professionalId}`),

  // My commissions (for professionals)
  getMyCommissions: () =>
    api.get<{ totalEarned: number; totalPending: number; pendingEntries: CommissionEntry[] }>('/finance/my/commissions'),

  // Cash Register
  getCashRegister: () => api.get<CashRegister>('/finance/cash-register'),

  getCashRegisterHistory: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<CashRegisterClose[]>(`/finance/cash-register/history?${query}`);
  },

  closeCashRegister: (data: { closedBy: string; notes?: string }) =>
    api.post<CashRegisterClose>('/finance/cash-register/close', data),
};

// ============================================
// Marketing API
// ============================================
export interface Campaign {
  id: string;
  name: string;
  segmentType: 'ALL' | 'NEW' | 'LOYAL' | 'INACTIVE' | 'VIP' | 'BIRTHDAY_MONTH' | 'RECURRING' | 'CUSTOM';
  message: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED';
  scheduledFor?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CampaignRecipient {
  id: string;
  clientId: string;
  sentAt?: string;
  failed: boolean;
  failedReason?: string;
  client: { id: string; name: string; phone: string };
}

export interface ClientRating {
  id: string;
  clientId: string;
  appointmentId: string;
  professionalId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client?: { name: string };
  professional?: { name: string };
  appointment?: { startTime: string; service: { name: string } };
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
  byProfessional: Array<{
    professionalId: string;
    professional?: { name: string };
    _avg: { rating: number };
    _count: number;
  }>;
}

export interface SegmentsOverview {
  all: number;
  new: number;
  loyal: number;
  inactive: number;
  vip: number;
  birthdayMonth: number;
  recurring: number;
}

export interface MarketingSuggestion {
  id: string;
  type: 'EMPTY_SLOT' | 'LOW_DEMAND_SERVICE' | 'INACTIVE_SEGMENT';
  title: string;
  description: string;
  suggestedAction: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  isActioned: boolean;
  dismissedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: 'WELCOME' | 'REMINDER' | 'BIRTHDAY' | 'REACTIVATION' | 'PROMOTION' | 'THANK_YOU' | 'FEEDBACK' | 'CUSTOM';
  content: string;
  variables: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export const marketingApi = {
  // Campaigns
  getCampaigns: (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    return api.get<Campaign[]>(`/marketing/campaigns?${query}`);
  },

  getCampaign: (id: string) => api.get<Campaign & { recipients: CampaignRecipient[] }>(`/marketing/campaigns/${id}`),

  createCampaign: (data: { name: string; segmentType: string; message: string; scheduledFor?: string; customFilter?: Record<string, unknown> }) =>
    api.post<Campaign>('/marketing/campaigns', data),

  updateCampaign: (id: string, data: Partial<Campaign>) =>
    api.put<Campaign>(`/marketing/campaigns/${id}`, data),

  deleteCampaign: (id: string) => api.delete(`/marketing/campaigns/${id}`),

  startCampaign: (id: string) => api.post<Campaign>(`/marketing/campaigns/${id}/start`),

  getCampaignStats: () =>
    api.get<{ total: number; byStatus: Record<string, number>; recentCampaigns: Campaign[] }>('/marketing/campaigns/stats'),

  // Ratings
  getRatings: (params?: { clientId?: string; professionalId?: string; minRating?: number }) => {
    const query = new URLSearchParams();
    if (params?.clientId) query.append('clientId', params.clientId);
    if (params?.professionalId) query.append('professionalId', params.professionalId);
    if (params?.minRating) query.append('minRating', params.minRating.toString());
    return api.get<ClientRating[]>(`/marketing/ratings?${query}`);
  },

  registerRating: (data: { clientId: string; appointmentId: string; professionalId: string; rating: number; comment?: string }) =>
    api.post<ClientRating>('/marketing/ratings', data),

  getRatingStats: () => api.get<RatingStats>('/marketing/ratings/stats'),

  // Segments
  getSegmentsOverview: () => api.get<SegmentsOverview>('/marketing/segments'),

  getSegmentClients: (segment: string) =>
    api.get<Array<{ id: string; name: string; phone: string; birthDate?: string }>>(`/marketing/segments/${segment}/clients`),

  // Suggestions
  getSuggestions: (includeRead?: boolean) => {
    const query = includeRead ? '?includeRead=true' : '';
    return api.get<MarketingSuggestion[]>(`/marketing/suggestions${query}`);
  },

  getSuggestionCounts: () =>
    api.get<{ total: number; unread: number; actioned: number }>('/marketing/suggestions/counts'),

  generateSuggestions: () => api.post('/marketing/suggestions/generate'),

  markSuggestionRead: (id: string) => api.put(`/marketing/suggestions/${id}/read`),

  markSuggestionActioned: (id: string) => api.put(`/marketing/suggestions/${id}/action`),

  dismissSuggestion: (id: string) => api.delete(`/marketing/suggestions/${id}`),

  getIdleSlots: () => api.get<Array<{ date: string; period: string; professionalId: string; professionalName: string; emptyHours: number }>>('/marketing/idle-slots'),

  // Templates
  getTemplates: () => api.get<ContentTemplate[]>('/marketing/templates'),

  getTemplate: (id: string) => api.get<ContentTemplate>(`/marketing/templates/${id}`),

  getTemplatesByCategory: (category: string) => api.get<ContentTemplate[]>(`/marketing/templates/category/${category}`),

  createTemplate: (data: { name: string; category: string; content: string; variables?: string[] }) =>
    api.post<ContentTemplate>('/marketing/templates', data),

  updateTemplate: (id: string, data: Partial<ContentTemplate>) =>
    api.put<ContentTemplate>(`/marketing/templates/${id}`, data),

  deleteTemplate: (id: string) => api.delete(`/marketing/templates/${id}`),

  duplicateTemplate: (id: string) => api.post<ContentTemplate>(`/marketing/templates/${id}/duplicate`),

  fillTemplate: (id: string, variables: Record<string, string>) =>
    api.post<{ content: string }>(`/marketing/templates/${id}/fill`, { variables }),
};

// ============================================
// Clients API
// ============================================
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  notes?: string;
  totalAppointments: number;
  totalSpent: number;
  lastVisitAt?: string;
  tags?: string[];
  createdAt: string;
}

export interface ClientDetails extends Client {
  appointments: Array<{
    id: string;
    startTime: string;
    status: string;
    service: { name: string };
    professional: { name: string };
  }>;
}

export const clientsApi = {
  getClients: async (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const { data: clients, pagination } = await api.getPaginated<Client[]>(`/clients?${query}`);
    return { clients, total: pagination.total, page: pagination.page, pages: pagination.pages ?? 1 };
  },

  getClient: (id: string) => api.get<ClientDetails>(`/clients/${id}`),

  createClient: (data: { name: string; phone: string; email?: string; birthDate?: string; notes?: string }) =>
    api.post<Client>('/clients', data),

  updateClient: (id: string, data: Partial<Client>) =>
    api.put<Client>(`/clients/${id}`, data),

  deleteClient: (id: string) => api.delete(`/clients/${id}`),

  getBirthdays: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return api.get<Client[]>(`/clients/birthdays?${query}`);
  },

  getInactive: (days?: number) => {
    const query = days ? `?days=${days}` : '';
    return api.get<Client[]>(`/clients/inactive${query}`);
  },

  getStats: (clientId: string) =>
    api.get<{ totalVisits: number; totalSpent: number; averageTicket: number; favoriteService?: string }>(`/clients/${clientId}/stats`),
};

// ============================================
// Services API
// ============================================
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  professionals?: Array<{ id: string; name: string; customPrice?: number; customDuration?: number }>;
}

export const servicesApi = {
  getServices: (params?: { active?: boolean }) => {
    const query = params?.active !== undefined ? `?active=${params.active}` : '';
    return api.get<Service[]>(`/services${query}`);
  },

  getService: (id: string) => api.get<Service>(`/services/${id}`),

  createService: (data: { name: string; duration: number; price: number; description?: string; category?: string }) =>
    api.post<Service>('/services', data),

  updateService: (id: string, data: Partial<Service>) =>
    api.put<Service>(`/services/${id}`, data),

  deleteService: (id: string) => api.delete(`/services/${id}`),

  assignProfessional: (serviceId: string, professionalId: string, data?: { customPrice?: number; customDuration?: number }) =>
    api.post(`/services/${serviceId}/professionals/${professionalId}`, data),

  removeProfessional: (serviceId: string, professionalId: string) =>
    api.delete(`/services/${serviceId}/professionals/${professionalId}`),
};

// ============================================
// Appointments API
// ============================================
export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  price: number;
  notes?: string;
  reminderSent: boolean;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  client?: { id: string; name: string; phone: string };
  professional?: { id: string; name: string; color?: string };
  service?: { id: string; name: string; duration: number };
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export const appointmentsApi = {
  getAppointments: (params?: { date?: string; startDate?: string; endDate?: string; professionalId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.professionalId) query.append('professionalId', params.professionalId);
    if (params?.status) query.append('status', params.status);
    return api.get<Appointment[]>(`/appointments?${query}`);
  },

  getAppointment: (id: string) => api.get<Appointment>(`/appointments/${id}`),

  createAppointment: (data: { clientId: string; professionalId: string; serviceId: string; startTime: string; notes?: string }) =>
    api.post<Appointment>('/appointments', data),

  updateAppointment: (id: string, data: Partial<Appointment>) =>
    api.put<Appointment>(`/appointments/${id}`, data),

  confirmAppointment: (id: string) => api.post<Appointment>(`/appointments/${id}/confirm`),

  cancelAppointment: (id: string, reason?: string) =>
    api.post<Appointment>(`/appointments/${id}/cancel`, { reason }),

  completeAppointment: (id: string) => api.post<Appointment>(`/appointments/${id}/complete`),

  markNoShow: (id: string) => api.post<Appointment>(`/appointments/${id}/no-show`),

  getAvailability: (params: { professionalId: string; serviceId: string; date: string }) => {
    const query = new URLSearchParams(params);
    return api.get<AvailableSlot[]>(`/appointments/availability?${query}`);
  },

  getUpcoming: (clientId: string) =>
    api.get<Appointment[]>(`/appointments/client/${clientId}/upcoming`),

  getToday: () => api.get<Appointment[]>('/appointments/today'),
};

// ============================================
// Professionals API
// ============================================
export interface Professional {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'PROFESSIONAL' | 'ADMIN' | 'OWNER' | 'RECEPTIONIST';
  color?: string;
  commission?: number;
  isActive: boolean;
  services?: Service[];
}

export const professionalsApi = {
  getProfessionals: (params?: { active?: boolean }) => {
    const query = params?.active !== undefined ? `?active=${params.active}` : '';
    return api.get<Professional[]>(`/business/professionals${query}`);
  },

  getProfessional: (id: string) => api.get<Professional>(`/business/professionals/${id}`),

  createProfessional: (data: { name: string; phone: string; email?: string; color?: string; commission?: number }) =>
    api.post<Professional>('/business/professionals', data),

  updateProfessional: (id: string, data: Partial<Professional>) =>
    api.put<Professional>(`/business/professionals/${id}`, data),

  deleteProfessional: (id: string) => api.delete(`/business/professionals/${id}`),
};

// ============================================
// Waitlist API
// ============================================
export interface WaitlistEntry {
  id: string;
  clientId: string;
  serviceId: string;
  professionalId?: string;
  desiredDate: string;
  flexibleDates: boolean;
  status: 'WAITING' | 'NOTIFIED' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
  priority: number;
  notifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
  client?: { name: string; phone: string };
  service?: { name: string };
  professional?: { name: string };
}

export const waitlistApi = {
  getWaitlist: (params?: { status?: string; serviceId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.serviceId) query.append('serviceId', params.serviceId);
    return api.get<WaitlistEntry[]>(`/waitlist?${query}`);
  },

  addToWaitlist: (data: { clientId: string; serviceId: string; professionalId?: string; desiredDate: string; flexibleDates?: boolean }) =>
    api.post<WaitlistEntry>('/waitlist', data),

  removeFromWaitlist: (id: string) => api.delete(`/waitlist/${id}`),

  notifyClient: (id: string) => api.post<WaitlistEntry>(`/waitlist/${id}/notify`),

  convertToAppointment: (id: string, appointmentId: string) =>
    api.post<WaitlistEntry>(`/waitlist/${id}/convert`, { appointmentId }),

  getStats: () =>
    api.get<{ waiting: number; notified: number; converted: number; expired: number }>('/waitlist/stats'),
};

// ============================================
// Loyalty API
// ============================================
export interface LoyaltyProgram {
  id: string;
  name: string;
  type: 'VISITS' | 'POINTS' | 'SPENDING';
  targetValue: number;
  rewardType: 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED' | 'FREE_SERVICE';
  rewardValue: number;
  rewardServiceId?: string;
  isActive: boolean;
}

export interface ClientLoyalty {
  id: string;
  clientId: string;
  programId: string;
  currentProgress: number;
  completedCount: number;
  client?: { name: string };
  program?: LoyaltyProgram;
}

export const loyaltyApi = {
  getPrograms: () => api.get<LoyaltyProgram[]>('/loyalty/programs'),

  getProgram: (id: string) => api.get<LoyaltyProgram>(`/loyalty/programs/${id}`),

  createProgram: (data: Partial<LoyaltyProgram>) =>
    api.post<LoyaltyProgram>('/loyalty/programs', data),

  updateProgram: (id: string, data: Partial<LoyaltyProgram>) =>
    api.put<LoyaltyProgram>(`/loyalty/programs/${id}`, data),

  deleteProgram: (id: string) => api.delete(`/loyalty/programs/${id}`),

  getClientLoyalty: (clientId: string) =>
    api.get<ClientLoyalty[]>(`/loyalty/clients/${clientId}`),

  getStats: () =>
    api.get<{ totalPrograms: number; activeClients: number; rewardsRedeemed: number }>('/loyalty/stats'),
};

// ============================================
// Business API
// ============================================
export interface BusinessSettings {
  workingHoursStart: string;
  workingHoursEnd: string;
  slotDuration: number;
  allowOnlineBooking: boolean;
  requireConfirmation: boolean;
  reminderHoursBefore: number;
  cancellationPolicy?: string;
}

export const businessApi = {
  getBusiness: () => api.get<Business>('/business'),

  updateBusiness: (data: Partial<Business>) =>
    api.put<Business>('/business', data),

  getSettings: () => api.get<BusinessSettings>('/business/settings'),

  updateSettings: (data: Partial<BusinessSettings>) =>
    api.put<BusinessSettings>('/business/settings', data),

  getWorkingHours: () =>
    api.get<Array<{ dayOfWeek: number; startTime: string; endTime: string; isOpen: boolean }>>('/business/working-hours'),

  updateWorkingHours: (data: Array<{ dayOfWeek: number; startTime: string; endTime: string; isOpen: boolean }>) =>
    api.put('/business/working-hours', data),
};

// ============================================
// Automation API
// ============================================
export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

export const automationApi = {
  getRules: () => api.get<AutomationRule[]>('/automation/rules'),

  getRule: (id: string) => api.get<AutomationRule>(`/automation/rules/${id}`),

  createRule: (data: Partial<AutomationRule>) =>
    api.post<AutomationRule>('/automation/rules', data),

  updateRule: (id: string, data: Partial<AutomationRule>) =>
    api.put<AutomationRule>(`/automation/rules/${id}`, data),

  deleteRule: (id: string) => api.delete(`/automation/rules/${id}`),

  toggleRule: (id: string, isActive: boolean) =>
    api.put<AutomationRule>(`/automation/rules/${id}`, { isActive }),

  getStats: () =>
    api.get<{ totalRules: number; activeRules: number; executionsToday: number }>('/automation/stats'),
};
