/**
 * API Service Layer for FastAPI Backend Integration
 * Configure API_BASE_URL in .env or update here
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Types matching your FastAPI models
export interface Tenant {
  id: string;
  nome: string;
  plano: string;
  created_at: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  created_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
}

export interface Grupo {
  id: string;
  tenant_id: string;
  nome: string;
  tipo: 'familia' | 'viagem' | 'evento';
  created_at: string;
}

export interface Categoria {
  id: string;
  tenant_id: string;
  nome: string;
  tipo: string;
}

export interface Gasto {
  id: string;
  tenant_id: string;
  user_id: string;
  grupo_id: string | null;
  categoria_id: string;
  valor: number;
  data: string;
  descricao: string;
  created_at: string;
  // Joined fields for display
  categoria_nome?: string;
  grupo_nome?: string;
  user_nome?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreateGastoData {
  categoria_id: string;
  grupo_id?: string | null;
  valor: number;
  data: string;
  descricao: string;
}

export interface CreateGrupoData {
  nome: string;
  tipo: 'familia' | 'viagem' | 'evento';
}

export interface CreateCategoriaData {
  nome: string;
  tipo: string;
}

export interface CreateTenantData {
  nome: string;
  plano?: string;
}

class ApiService {
  private token: string | null = null;
  private currentTenantId: string | null = null;

  constructor() {
    // Load from localStorage on init
    this.token = localStorage.getItem('auth_token');
    this.currentTenantId = localStorage.getItem('current_tenant_id');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.currentTenantId) {
      headers['X-Tenant-ID'] = this.currentTenantId;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  setCurrentTenant(tenantId: string) {
    this.currentTenantId = tenantId;
    localStorage.setItem('current_tenant_id', tenantId);
  }

  clearCurrentTenant() {
    this.currentTenantId = null;
    localStorage.removeItem('current_tenant_id');
  }

  getCurrentTenantId(): string | null {
    return this.currentTenantId;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async logout(): Promise<void> {
    this.clearToken();
    this.clearCurrentTenant();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Tenants
  async getTenants(): Promise<Tenant[]> {
    return this.request<Tenant[]>('/tenants');
  }

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    return this.request<Tenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinTenant(tenantId: string): Promise<TenantUser> {
    return this.request<TenantUser>(`/tenants/${tenantId}/join`, {
      method: 'POST',
    });
  }

  async getTenantUsers(): Promise<(TenantUser & { user: User })[]> {
    return this.request<(TenantUser & { user: User })[]>('/tenants/users');
  }

  // Grupos
  async getGrupos(): Promise<Grupo[]> {
    return this.request<Grupo[]>('/grupos');
  }

  async createGrupo(data: CreateGrupoData): Promise<Grupo> {
    return this.request<Grupo>('/grupos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteGrupo(id: string): Promise<void> {
    await this.request(`/grupos/${id}`, { method: 'DELETE' });
  }

  // Categorias
  async getCategorias(): Promise<Categoria[]> {
    return this.request<Categoria[]>('/categorias');
  }

  async createCategoria(data: CreateCategoriaData): Promise<Categoria> {
    return this.request<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCategoria(id: string): Promise<void> {
    await this.request(`/categorias/${id}`, { method: 'DELETE' });
  }

  // Gastos
  async getGastos(filters?: { grupo_id?: string; categoria_id?: string }): Promise<Gasto[]> {
    const params = new URLSearchParams();
    if (filters?.grupo_id) params.append('grupo_id', filters.grupo_id);
    if (filters?.categoria_id) params.append('categoria_id', filters.categoria_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Gasto[]>(`/gastos${query}`);
  }

  async createGasto(data: CreateGastoData): Promise<Gasto> {
    return this.request<Gasto>('/gastos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGasto(id: string, data: Partial<CreateGastoData>): Promise<Gasto> {
    return this.request<Gasto>(`/gastos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGasto(id: string): Promise<void> {
    await this.request(`/gastos/${id}`, { method: 'DELETE' });
  }

  // Dashboard / Stats
  async getDashboardStats(): Promise<{
    total_gastos: number;
    gastos_pessoais: number;
    gastos_grupo: number;
    por_categoria: { categoria: string; total: number }[];
    por_grupo: { grupo: string; total: number }[];
    ultimos_gastos: Gasto[];
  }> {
    return this.request('/dashboard/stats');
  }
}

export const api = new ApiService();
export default api;
