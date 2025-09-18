import { RegisterRequest, LoginRequest, AuthResponse, RegistrationOptions, AuthenticationOptions, ErrorResponse, User } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error.message);
    }

    return response.json();
  }

  // 注册相关
  async getRegistrationChallenge(username: string): Promise<RegistrationOptions> {
    return this.request<RegistrationOptions>('/auth/register/challenge', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async verifyRegistration(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 登录相关
  async getLoginChallenge(username: string): Promise<AuthenticationOptions> {
    return this.request<AuthenticationOptions>('/auth/login/challenge', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async verifyLogin(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login/verify', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  // 用户相关
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/user/me', {
      method: 'GET',
      credentials: 'include',
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiClient = new ApiClient();