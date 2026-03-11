import { create } from 'zustand';
import api from '../api/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,

  // ===== FETCH NOTIFICATIONS =====
  fetchNotifications: async (page = 0, size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications', {
        params: { page, size }
      });
      set({
        notifications: response.data.content || [],
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || 1,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch notifications',
        notifications: []
      });
    }
  },

  // ===== FETCH UNREAD COUNT =====
  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      set({ unreadCount: response.data || 0 });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  // ===== MARK AS READ =====
  markAsRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // ===== MARK ALL AS READ =====
  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  // ===== POLL FOR NEW NOTIFICATIONS (call this every 30 seconds) =====
  pollForUpdates: () => {
    const poll = async () => {
      await get().fetchUnreadCount();
    };
    
    // Poll immediately
    poll();
    
    // Set up interval
    const interval = setInterval(poll, 30000); // 30 seconds
    
    // Return cleanup function
    return () => clearInterval(interval);
  },

  clearError: () => set({ error: null })
}));