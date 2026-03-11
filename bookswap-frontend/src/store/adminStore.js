import { create } from 'zustand';
import api from '../api/api';

export const useAdminStore = create((set, get) => ({
  // Dashboard Stats
  stats: {
    totalUsers: 0,
    totalBooks: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeTransactions: 0,
    pendingRequests: 0,
    booksByType: {
      SWAP: 0,
      BORROW: 0,
      RENT: 0,
      DONATE: 0
    },
    transactionsByStatus: {
      PENDING: 0,
      APPROVED: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0
    },
    recentUsers: [],
    recentTransactions: [],
    popularCategories: []
  },

  users: [],
  books: [],
  transactions: [],
  revenueStats: null,
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,

  // ===== DASHBOARD STATS =====
  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching dashboard stats...'); // Debug log
      const response = await api.get('/admin/dashboard/stats');
      console.log('Dashboard stats response:', response.data); // Debug log
      set({ 
        stats: response.data || get().stats,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch dashboard stats' 
      });
      throw error;
    }
  },

  // ===== USERS MANAGEMENT =====
  fetchAllUsers: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching users...'); // Debug log
      const response = await api.get('/admin/users', {
        params: { page, size }
      });
      console.log('Users response:', response.data); // Debug log
      set({ 
        users: response.data.content || [],
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || page,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch users',
        users: []
      });
      throw error;
    }
  },

  // ===== BOOKS MANAGEMENT =====
  fetchAllBooks: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching books...'); // Debug log
      const response = await api.get('/admin/books', {
        params: { page, size }
      });
      console.log('Books response:', response.data); // Debug log
      set({ 
        books: response.data.content || [],
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || page,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch books',
        books: []
      });
      throw error;
    }
  },

  // ===== TRANSACTIONS MANAGEMENT =====
  fetchAllTransactions: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching transactions...'); // Debug log
      const response = await api.get('/admin/transactions', {
        params: { page, size }
      });
      console.log('Transactions response:', response.data); // Debug log
      set({ 
        transactions: response.data.content || [],
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || page,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions',
        transactions: []
      });
      throw error;
    }
  },

  // ===== USER ACTIONS =====
  toggleUserStatus: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Toggling user status:', userId); // Debug log
      const response = await api.put(`/admin/users/${userId}/toggle-status`);
      console.log('Toggle status response:', response.data); // Debug log
      // Refresh users list
      await get().fetchAllUsers();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to toggle user status' 
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Deleting user:', userId); // Debug log
      await api.delete(`/admin/users/${userId}`);
      // Refresh users list
      await get().fetchAllUsers();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error deleting user:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete user' 
      });
      throw error;
    }
  },

  // ===== BOOK ACTIONS =====
  deleteBook: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Deleting book:', bookId); // Debug log
      await api.delete(`/admin/books/${bookId}`);
      // Refresh books list
      await get().fetchAllBooks();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error deleting book:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete book' 
      });
      throw error;
    }
  },

  // ===== REVENUE TRACKING =====
  fetchRevenueStats: async (period = 'month') => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching revenue stats for period:', period); // Debug log
      const response = await api.get('/admin/revenue', {
        params: { period }
      });
      console.log('Revenue stats response:', response.data); // Debug log
      set({ 
        revenueStats: response.data,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch revenue stats' 
      });
      throw error;
    }
  },

  // ===== USER STATS =====
  fetchUserStats: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching user stats for user:', userId); // Debug log
      const response = await api.get(`/admin/users/${userId}/stats`);
      console.log('User stats response:', response.data); // Debug log
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch user stats' 
      });
      throw error;
    }
  },

  // ===== BOOK STATS =====
  fetchBookStats: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching book stats for book:', bookId); // Debug log
      const response = await api.get(`/admin/books/${bookId}/stats`);
      console.log('Book stats response:', response.data); // Debug log
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching book stats:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch book stats' 
      });
      throw error;
    }
  },

  // ===== CLEAR ERROR =====
  clearError: () => set({ error: null })
}));