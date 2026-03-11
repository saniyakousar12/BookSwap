import { create } from 'zustand';
import api from '../api/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // Signup with userData object
  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Sending signup request with data:', userData);
      
      const response = await api.post('/auth/signup', userData);
      
      console.log('Signup response:', response.data);

      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        token, 
        isLoading: false, 
        error: null 
      });
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Signup failed';
      set({ 
        isLoading: false, 
        error: message 
      });
      throw error;
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        token, 
        isLoading: false, 
        error: null 
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ 
        isLoading: false, 
        error: message 
      });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Check if logged in
  isLoggedIn: () => {
    const state = get();
    return !!state.token && !!state.user;
  }
}));

export default useAuthStore;