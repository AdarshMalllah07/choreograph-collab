// Debug environment variables
console.log('=== Environment Debug ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('All env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.29.220:5001/api';
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('=== End Environment Debug ===');

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      console.log('Attempting to refresh access token...');
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.log('Refresh token failed:', response.status);
        return false;
      }

      const data = await response.json();
      if (data.accessToken) {
        console.log('Access token refreshed successfully');
        localStorage.setItem('token', data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making API request to:', url);
      const response = await fetch(url, {
        ...options,
        headers: this.getAuthHeaders(),
        ...options,
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        
        // Handle 401 errors with automatic token refresh
        if (response.status === 401) {
          console.log('API Service - 401 error detected, attempting token refresh');
          
          // Try to refresh the token
          const refreshSuccess = await this.refreshAccessToken();
          
          if (refreshSuccess) {
            console.log('Token refreshed, retrying original request');
            // Retry the original request with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: this.getAuthHeaders(),
              ...options,
            });
            
            if (retryResponse.ok) {
              if (retryResponse.status === 204) {
                return { message: 'Success' };
              }
              const retryData = await retryResponse.json();
              return { data: retryData };
            }
          }
          
          // If refresh failed or retry failed, clear tokens
          console.log('API Service - Token refresh failed, clearing invalid tokens');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return { message: 'Success' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(name: string, email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(projectId: string) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(name: string, description?: string) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async updateProject(projectId: string, updates: { name?: string; description?: string }) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async addProjectMember(projectId: string, email: string) {
    return this.request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async removeProjectMember(projectId: string, memberId: string) {
    return this.request(`/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(projectId: string) {
    return this.request(`/projects/${projectId}/tasks`);
  }

  async getTask(projectId: string, taskId: string) {
    return this.request(`/projects/${projectId}/tasks/${taskId}`);
  }

  async createTask(projectId: string, taskData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    order?: number;
    deadline?: string;
  }) {
    return this.request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(projectId: string, taskId: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    order?: number;
    deadline?: string;
  }) {
    return this.request(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(projectId: string, taskId: string) {
    return this.request(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async assignTask(projectId: string, taskId: string, assigneeId: string) {
    return this.request(`/projects/${projectId}/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId }),
    });
  }

  async unassignTask(projectId: string, taskId: string) {
    return this.request(`/projects/${projectId}/tasks/${taskId}/assign`, {
      method: 'DELETE',
    });
  }

  // Column endpoints
  async getColumns(projectId: string) {
    return this.request(`/projects/${projectId}/columns`);
  }

  async createColumn(projectId: string, name: string, order?: number) {
    return this.request(`/projects/${projectId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ name, order }),
    });
  }

  async updateColumn(projectId: string, columnId: string, updates: { name?: string; order?: number }) {
    return this.request(`/projects/${projectId}/columns/${columnId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteColumn(projectId: string, columnId: string) {
    return this.request(`/projects/${projectId}/columns/${columnId}`, {
      method: 'DELETE',
    });
  }

  async reorderColumns(projectId: string, columns: { id: string; order: number }[]) {
    return this.request(`/projects/${projectId}/columns/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ columns }),
    });
  }

  async fixColumnOrder(projectId: string) {
    return this.request(`/projects/${projectId}/columns/fix-order`, {
      method: 'POST',
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/users/profile');
  }

  async updateCurrentUser(updates: { name?: string; avatar?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUserProjects() {
    return this.request('/users/profile/projects');
  }

  async deleteCurrentUser() {
    return this.request('/users/profile', {
      method: 'DELETE',
    });
  }

  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async searchUsers(query: string) {
    return this.request(`/users/search/${query}`);
  }

  async getProjectUsers(projectId: string) {
    return this.request(`/users/project/${projectId}`);
  }
}

export const apiService = new ApiService();
export default apiService;
