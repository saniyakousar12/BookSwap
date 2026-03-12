import { create } from 'zustand';
import api from '../api/api';

export const useSearchStore = create((set, get) => ({
  searchResults: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  error: null,
  priceRange: null,
  priceComparisons: [],
  availabilitySlots: [],

  // Advanced search
  advancedSearch: async (searchParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/search/advanced', searchParams);
      set({
        searchResults: response.data.books || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || 0,
        priceRange: response.data.priceRange,
        priceComparisons: response.data.priceComparisons || [],
        availabilitySlots: response.data.availabilitySlots || [],
        isLoading: false
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Search failed',
        searchResults: []
      });
    }
  },

  // Simple search (for backward compatibility)
  simpleSearch: async (query, page = 0, size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/search/simple?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      set({
        searchResults: response.data.books || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || 0,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      console.error('Simple search error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Search failed',
        searchResults: []
      });
    }
  },

  // Get price range for rent books
  fetchPriceRange: async () => {
    try {
      const response = await api.get('/search/price-range');
      set({ priceRange: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching price range:', error);
    }
  },

  // Compare rental prices
  comparePrices: async (category, maxDistance) => {
    try {
      const url = `/search/compare-prices?category=${category}` + 
                  (maxDistance ? `&maxDistance=${maxDistance}` : '');
      const response = await api.get(url);
      set({ priceComparisons: response.data || [] });
      return response.data;
    } catch (error) {
      console.error('Error comparing prices:', error);
    }
  },

  // Get book availability
  fetchBookAvailability: async (bookId) => {
    try {
      const response = await api.get(`/search/availability/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  },
  // Add this method to manually set search results
setSearchResults: (data) => set({
  searchResults: data.content || [],
  totalElements: data.totalElements || 0,
  totalPages: data.totalPages || 0,
  currentPage: data.currentPage || 0,
  isLoading: false
}),
  clearSearch: () => set({
    searchResults: [],
    priceRange: null,
    priceComparisons: [],
    availabilitySlots: []
  })
}));