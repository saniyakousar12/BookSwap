import { create } from 'zustand';
import api from '../api/api';

export const useReviewStore = create((set, get) => ({
  bookReviews: [],
  userReviews: [],
  averageRating: 0,
  reviewCount: 0,
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,

  // ===== FETCH BOOK REVIEWS =====
  fetchBookReviews: async (bookId, page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/reviews/book/${bookId}`, {
        params: { page, size }
      });
      set({
        bookReviews: response.data.content || [],
        currentPage: response.data.number || page,
        totalPages: response.data.totalPages || 1,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch reviews',
        bookReviews: []
      });
    }
  },

  // ===== FETCH USER REVIEWS =====
  fetchUserReviews: async (userId, page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/reviews/user/${userId}`, {
        params: { page, size }
      });
      set({
        userReviews: response.data.content || [],
        currentPage: response.data.number || page,
        totalPages: response.data.totalPages || 1,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch user reviews',
        userReviews: []
      });
    }
  },

  // ===== CREATE BOOK REVIEW =====
  createBookReview: async (reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/reviews/book', reviewData);
      // Refresh reviews after adding
      await get().fetchBookReviews(reviewData.bookId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create review'
      });
      throw error;
    }
  },

  // ===== CREATE USER REVIEW =====
  createUserReview: async (reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/reviews/user', reviewData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create user review'
      });
      throw error;
    }
  },

  // ===== FETCH AVERAGE RATING =====
  fetchAverageRating: async (bookId) => {
    try {
      const response = await api.get(`/reviews/book/${bookId}/average`);
      set({ averageRating: response.data || 0 });
      return response.data;
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  },

  // ===== FETCH REVIEW COUNT =====
  fetchReviewCount: async (bookId) => {
    try {
      const response = await api.get(`/reviews/book/${bookId}/count`);
      set({ reviewCount: response.data || 0 });
      return response.data;
    } catch (error) {
      console.error('Error fetching review count:', error);
    }
  },

  clearError: () => set({ error: null })
}));