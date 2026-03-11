import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { 
  Bell, BookOpen, Users, IndianRupee, Clock, 
  Check, CheckCheck, X, Filter, ArrowLeft,
  Trash2, RefreshCw
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount
  } = useNotificationStore();

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadNotifications();
  }, [page, filter]);

  const loadNotifications = async () => {
    await fetchNotifications(page, 20);
    await fetchUnreadCount();
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_REQUEST':
      case 'REQUEST_APPROVED':
      case 'REQUEST_REJECTED':
        return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'TRANSACTION_STARTED':
      case 'TRANSACTION_COMPLETED':
        return <Users className="w-6 h-6 text-green-600" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        return <IndianRupee className="w-6 h-6 text-yellow-600" />;
      case 'RETURN_REMINDER':
      case 'RETURN_OVERDUE':
        return <Clock className="w-6 h-6 text-orange-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <CheckCheck size={18} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-500" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'You have no unread notifications'
                  : filter === 'read'
                  ? 'You have no read notifications'
                  : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Mark as read"
                          >
                            <Check size={20} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.relatedBook && (
                          <button
                            onClick={() => navigate(`/book/${notification.relatedBook.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Book
                          </button>
                        )}
                        {notification.relatedTransaction && (
                          <button
                            onClick={() => navigate('/requests')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Transaction
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {notifications.length >= 20 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setPage(page + 1)}
              className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}