import { create } from 'zustand';
import api from '../api/api';

export const useTransactionStore = create((set, get) => ({
  // State
  myRequests: [],
  receivedRequests: [],
  pendingRequests: [],
  currentTransaction: null,
  isLoading: false,
  currentPage: 0,
  totalPages: 0,
  pageSize: 10,
  error: null,

  // ===== REQUEST BOOK =====
  requestBook: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/transactions/request', requestData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to request book' 
      });
      throw error;
    }
  },

  // ===== APPROVE REQUEST =====
  approveRequest: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${transactionId}/approve`);
      // Refresh lists after approval
      await get().fetchReceivedRequests();
      await get().fetchPendingRequests();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to approve request' 
      });
      throw error;
    }
  },

  // ===== REJECT REQUEST =====
  rejectRequest: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${transactionId}/reject`);
      await get().fetchReceivedRequests();
      await get().fetchPendingRequests();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to reject request' 
      });
      throw error;
    }
  },

  // ===== START TRANSACTION =====
  startTransaction: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${transactionId}/start`);
      await get().fetchMyRequests();
      await get().fetchReceivedRequests();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to start transaction' 
      });
      throw error;
    }
  },

  // ===== COMPLETE TRANSACTION =====
  completeTransaction: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${transactionId}/complete`);
      await get().fetchMyRequests();
      await get().fetchReceivedRequests();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to complete transaction' 
      });
      throw error;
    }
  },

  // ===== CANCEL REQUEST =====
  cancelRequest: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${transactionId}/cancel`);
      await get().fetchMyRequests();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to cancel request' 
      });
      throw error;
    }
  },

  // ===== FETCH MY REQUESTS (as requester) =====
  fetchMyRequests: async (page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/transactions/my-requests', {
        params: { page, size: get().pageSize }
      });
      set({
        myRequests: response.data.content || [],
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || 1,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch requests',
        myRequests: []
      });
    }
  },

  // ===== FETCH RECEIVED REQUESTS (as owner) =====
  fetchReceivedRequests: async (page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/transactions/received-requests', {
        params: { page, size: get().pageSize }
      });
      set({
        receivedRequests: response.data.content || [],
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || 1,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch received requests',
        receivedRequests: []
      });
    }
  },

  // ===== FETCH PENDING REQUESTS (for owner) =====
  fetchPendingRequests: async (page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/transactions/pending', {
        params: { page, size: get().pageSize }
      });
      set({
        pendingRequests: response.data.content || [],
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || 1,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch pending requests',
        pendingRequests: []
      });
    }
  },

  // ===== FETCH SINGLE TRANSACTION =====
  fetchTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/transactions/${id}`);
      set({
        currentTransaction: response.data,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch transaction',
        currentTransaction: null
      });
      throw error;
    }
  },

  // ===== CLEAR TRANSACTIONS =====
  clearTransactions: () => set({
    myRequests: [],
    receivedRequests: [],
    pendingRequests: [],
    currentTransaction: null,
    error: null
  })
}));