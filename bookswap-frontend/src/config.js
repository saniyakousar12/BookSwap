// Application configuration
const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
  },

  // App Information
  app: {
    name: import.meta.env.VITE_APP_NAME || 'BookSwap',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    ai: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
    chat: import.meta.env.VITE_ENABLE_CHAT === 'true',
  },

  // External APIs
  external: {
    googleBooksApiKey: import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '',
  },

  // Upload Settings
  upload: {
    maxSize: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE || '5') * 1024 * 1024, // Convert to bytes
    supportedFormats: (import.meta.env.VITE_SUPPORTED_IMAGE_FORMATS || 'jpeg,png,jpg,webp').split(','),
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Routes
  routes: {
    home: '/',
    login: '/login',
    signup: '/signup',
    dashboard: '/dashboard',
    admin: '/admin',
    books: '/books',
    wishlist: '/wishlist',
    profile: '/profile',
    transactions: '/transactions',
    messages: '/messages',
  },

  // Local Storage Keys
  storage: {
    token: 'token',
    user: 'user',
    theme: 'theme',
    settings: 'settings',
  },

  // Theme Configuration
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
  },
};

export default config;