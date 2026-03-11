import { create } from 'zustand';
import api from '../api/api';

// Hardcoded fallback categories — used if /books/categories endpoint doesn't exist
const FALLBACK_CATEGORIES = [
  'FICTION',
  'NON_FICTION',
  'SCIENCE',
  'TECHNOLOGY',
  'HISTORY',
  'BIOGRAPHY',
  'FANTASY',
  'MYSTERY',
  'ROMANCE',
  'SELF_HELP',
  'CHILDREN',
  'EDUCATION',
  'ART',
  'TRAVEL',
  'COOKING',
  'OTHER',
];

export const useBookStore = create((set, get) => ({
  books: [],
  selectedBook: null,
  wishlist: [],
  categories: [],
  isLoading: false,
  currentPage: 0,
  totalPages: 0,
  pageSize: 12,
  totalBooks: 0,
  filters: {
    genre: '',
    status: 'AVAILABLE',
    search: '',
    sortBy: 'createdAt',
  },

  // Set filters
  setFilters: (filters) => set({ filters }),

  // ─── BOOKS ───────────────────────────────────────────────────────────────────

  // Fetch all books
  fetchAllBooks: async (page = 0, filters = {}) => {
    set({ isLoading: true });
    try {
      const params = { page, size: get().pageSize, ...filters };
      const response = await api.get('/books', { params });
      const data = response.data;
      set({
        books: data.content || data.data || data || [],
        currentPage: data.number ?? page,
        totalPages: data.totalPages ?? 1,
        totalBooks: data.totalElements ?? 0,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Alias
  fetchBooks: async (page = 0, filters = {}) => {
    return get().fetchAllBooks(page, filters);
  },

  // Fetch user's books
  fetchUserBooks: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/books/user/my-books');
      set({
        books: response.data.content || response.data.data || response.data || [],
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, books: [] });
      console.error('Error fetching user books:', error);
    }
  },

  // Fetch books by category
  fetchBooksByCategory: async (category, page = 0) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/books', {
        params: { page, size: get().pageSize, category },
      });
      const data = response.data;
      set({
        books: data.content || data.data || data || [],
        currentPage: data.number ?? page,
        totalPages: data.totalPages ?? 1,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Search books
  searchBooks: async (keyword, category = null, page = 0) => {
    set({ isLoading: true });
    try {
      const params = { keyword, page, size: get().pageSize };
      if (category) params.category = category;
      const response = await api.get('/books/search', { params });
      const data = response.data;
      set({
        books: data.content || data.data || data || [],
        currentPage: data.number ?? page,
        totalPages: data.totalPages ?? 1,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Get single book
  fetchBook: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/books/${id}`);
      set({ selectedBook: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Add a new book
  addBook: async (bookData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/books', bookData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/books/${id}`, bookData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Delete book
  deleteBook: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/books/${id}`);
      set((state) => ({
        books: state.books.filter((book) => book.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      const response = await api.get('/books/categories/all');
      const data = response.data;
      const cats = Array.isArray(data) ? data : FALLBACK_CATEGORIES;
      set({ categories: cats });
      return cats;
    } catch (error) {
      set({ categories: FALLBACK_CATEGORIES });
    }
  },

  // ─── WISHLIST ─────────────────────────────────────────────────────────────────

  // Fetch wishlist
  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/books/wishlist');
      set({
        wishlist: response.data || [],
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      set({ isLoading: false, wishlist: [] });
    }
  },

  // Add to wishlist
  addToWishlist: async (bookId) => {
    try {
      await api.post(`/books/${bookId}/wishlist`);
      await get().fetchWishlist(); // Refresh wishlist
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (bookId) => {
    try {
      await api.delete(`/books/${bookId}/wishlist`);
      set((state) => ({
        wishlist: state.wishlist.filter((item) => 
          item.book?.id !== bookId && item.bookId !== bookId
        ),
      }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Check if in wishlist
  checkInWishlist: (bookId) => {
    const { wishlist } = get();
    return wishlist.some((item) => 
      item.book?.id === bookId || item.bookId === bookId
    );
  },

  // Clear books
  clearBooks: () => set({ books: [], selectedBook: null }),
}));