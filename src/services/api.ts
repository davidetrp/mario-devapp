const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api' 
  : 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthToken(): string | null {
    const token = localStorage.getItem('mario_token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const raw = await response.json();

      if (!response.ok) {
        const message = raw?.error || raw?.message || 'An error occurred';
        return { success: false, error: message };
      }

      // Normalize backend shape: { success, data } -> return just data
      const normalizedData = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw;
      return { success: true, data: normalizedData };
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, username: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Services endpoints
  async getServices(query?: string, filters?: any) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    
    return this.request<any[]>(endpoint);
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  async createService(serviceData: any) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: string, serviceData: any) {
    return this.request<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: string) {
    return this.request<any>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // User profile endpoints
  async updateProfile(profileData: any) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<{ url: string }>('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    });
  }
}

export const apiService = new ApiService();