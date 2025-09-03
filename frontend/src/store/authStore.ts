import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@taskflow.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@taskflow.com',
    role: 'user',
  },
];

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    // Mock authentication
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      set({ user, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  },
  
  signup: async (name: string, email: string, password: string) => {
    // Mock signup
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user',
    };
    mockUsers.push(newUser);
    set({ user: newUser, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('user');
  },
}));

// Check for existing session on load
const savedUser = localStorage.getItem('user');
if (savedUser) {
  const user = JSON.parse(savedUser);
  useAuthStore.setState({ user, isAuthenticated: true });
}