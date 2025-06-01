import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.81:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseURL = API_BASE_URL;

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log({error});
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, displayName: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(displayName?: string, bio?: string) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName, bio }),
    });
  }

  // Event endpoints
  async getEvents(category?: string, search?: string, limit = 20, offset = 0) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const queryString = params.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getEventById(eventId: string) {
    return this.request(`/events/${eventId}`);
  }

  async getEvent(eventId: string) {
    return this.getEventById(eventId);
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    category: string;
    location: {
      geoPoint: { latitude: number; longitude: number };
      address: string;
    };
    capacity: number;
    startTime: string;
    endTime: string;
  }) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, updates: any) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async joinEvent(eventId: string) {
    return this.request(`/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  async leaveEvent(eventId: string) {
    return this.request(`/events/${eventId}/leave`, {
      method: 'POST',
    });
  }

  async getEventAttendees(eventId: string) {
    return this.request(`/events/${eventId}/attendees`);
  }

  async getUserEvents(type: 'attending' | 'organized' = 'attending') {
    return this.request(`/user/events?type=${type}`);
  }

  // Category endpoints
  async getCategories() {
    return this.request('/categories');
  }

  // Admin endpoints
  async getAdminDashboardStats() {
    return this.request('/user/admin/dashboard/stats');
  }

  async getAllUsers(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request(`/user/admin/users?${params.toString()}`);
  }

  async promoteUserToAdmin(userId: string) {
    return this.request(`/user/admin/users/${userId}/promote`, {
      method: 'POST',
    });
  }

  async demoteUserFromAdmin(userId: string) {
    return this.request(`/user/admin/users/${userId}/demote`, {
      method: 'POST',
    });
  }

  async suspendUser(userId: string, reason: string) {
    return this.request(`/user/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Storage helpers
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }
}

export const apiService = new ApiService();
