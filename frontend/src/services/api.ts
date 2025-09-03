const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.29.220:5001/api';

// Debug logging to see which URL is being used
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getAuthHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
