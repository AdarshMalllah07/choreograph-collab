import { create } from 'zustand';
import { User } from '@/types';
import apiService from '@/services/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.login(email, password);
      
      if (response.data) {
        // Store tokens
        if (response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Get user profile
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.data) {
          set({ 
            user: userResponse.data, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          return true;
        }
      }
      
      set({ isLoading: false, error: 'Login failed' });
      return false;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Login failed' 
      });
      return false;
    }
  },
  
  signup: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.signup(name, email, password);
      
      if (response.data) {
        // Store tokens
        if (response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Get user profile
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.data) {
          set({ 
            user: userResponse.data, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          return true;
        }
      }
      
      set({ isLoading: false, error: 'Signup failed' });
      return false;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Signup failed' 
      });
      return false;
    }
  },
  
  logout: async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and tokens regardless of API response
      set({ user: null, isAuthenticated: false, error: null });
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },
  
  refreshUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getCurrentUser();
      
      if (response.data) {
        set({ 
          user: response.data, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        set({ 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      }
    } catch (error: any) {
      set({ 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message || 'Failed to refresh user' 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));

// Check for existing session on load
const token = localStorage.getItem('token');
if (token) {
  // Try to refresh user data
  useAuthStore.getState().refreshUser();
}