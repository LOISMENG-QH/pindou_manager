// API 服务层 - 处理所有后端 API 调用

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 用户信息接口
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

// 认证响应接口
export interface AuthResponse {
  user: User;
  token: string;
}

// 豆子接口
export interface Bead {
  id: string;
  colorCode: string;
  colorName: string;
  quantity: number;
  alertThreshold: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 图纸接口
export interface Pattern {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  description?: string;
  status: 'planned' | 'completed';
  beadsUsed?: BeadUsage[];
  analyzed?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BeadUsage {
  colorCode: string;
  colorName: string;
  quantity: number;
}

// Token 管理
class TokenManager {
  private static TOKEN_KEY = 'auth_token';
  
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  static isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

// API 请求封装
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = TokenManager.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  }
  
  // 认证相关
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  }
  
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }
  
  // 豆子管理
  async getBeads(): Promise<Bead[]> {
    return this.request<Bead[]>('/api/beads');
  }
  
  async createBead(bead: Omit<Bead, 'id'>): Promise<Bead> {
    return this.request<Bead>('/api/beads', {
      method: 'POST',
      body: JSON.stringify(bead),
    });
  }
  
  async updateBead(id: string, bead: Partial<Bead>): Promise<{ message: string }> {
    return this.request(`/api/beads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bead),
    });
  }
  
  async deleteBead(id: string): Promise<{ message: string }> {
    return this.request(`/api/beads/${id}`, {
      method: 'DELETE',
    });
  }
  
  // 图纸管理
  async getPatterns(): Promise<Pattern[]> {
    return this.request<Pattern[]>('/api/patterns');
  }
  
  async createPattern(pattern: Omit<Pattern, 'id'>): Promise<Pattern> {
    return this.request<Pattern>('/api/patterns', {
      method: 'POST',
      body: JSON.stringify(pattern),
    });
  }
  
  async updatePattern(id: string, pattern: Partial<Pattern>): Promise<{ message: string }> {
    return this.request(`/api/patterns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pattern),
    });
  }
  
  async deletePattern(id: string): Promise<{ message: string }> {
    return this.request(`/api/patterns/${id}`, {
      method: 'DELETE',
    });
  }
  
  // 数据同步
  async syncData(data: { beads: Bead[]; patterns: Pattern[] }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // 健康检查
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

// 导出单例
export const api = new ApiClient(API_BASE_URL);
export { TokenManager };
