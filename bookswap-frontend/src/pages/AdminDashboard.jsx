import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { 
  Users, BookOpen, TrendingUp, IndianRupee, 
  Calendar, CheckCircle, Clock, XCircle,
  Activity, BarChart3, PieChart, LogOut,
  RefreshCw, Search, Trash2, ToggleLeft, ToggleRight,
  Shield, AlertCircle, WifiOff, ServerCrash
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const adminStore = useAdminStore();
  
  // Destructure with fallbacks to prevent undefined errors
  const { 
    stats = {}, 
    users = [], 
    books = [], 
    transactions = [],
    isLoading = false,
    error = null,
    fetchDashboardStats,
    fetchAllUsers,
    fetchAllBooks,
    fetchAllTransactions,
    toggleUserStatus,
    deleteUser,
    deleteBook,
    fetchRevenueStats
  } = adminStore;

  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState({});

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDataLoaded(false);
    setLoadingErrors({});
    
    // Check if store methods exist
    const missingMethods = [];
    if (!fetchDashboardStats) missingMethods.push('fetchDashboardStats');
    if (!fetchAllUsers) missingMethods.push('fetchAllUsers');
    if (!fetchAllBooks) missingMethods.push('fetchAllBooks');
    if (!fetchAllTransactions) missingMethods.push('fetchAllTransactions');
    if (!fetchRevenueStats) missingMethods.push('fetchRevenueStats');

    if (missingMethods.length > 0) {
      console.error('Missing store methods:', missingMethods);
      setLoadingErrors({ 
        general: `Store methods missing: ${missingMethods.join(', ')}. Check adminStore.js` 
      });
      setDataLoaded(true);
      return;
    }

    // Load each data source independently to prevent one failure from breaking all
    const errors = {};
    
    try {
      console.log('Fetching dashboard stats...');
      await fetchDashboardStats();
      console.log('Dashboard stats fetched successfully');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      errors.dashboard = err.message || 'Failed to load dashboard stats';
    }

    try {
      console.log('Fetching users...');
      await fetchAllUsers(0, 10);
      console.log('Users fetched successfully');
    } catch (err) {
      console.error('Error fetching users:', err);
      errors.users = err.message || 'Failed to load users';
    }

    try {
      console.log('Fetching books...');
      await fetchAllBooks(0, 10);
      console.log('Books fetched successfully');
    } catch (err) {
      console.error('Error fetching books:', err);
      errors.books = err.message || 'Failed to load books';
    }

    try {
      console.log('Fetching transactions...');
      await fetchAllTransactions(0, 10);
      console.log('Transactions fetched successfully');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      errors.transactions = err.message || 'Failed to load transactions';
    }

    try {
      console.log('Fetching revenue stats...');
      await fetchRevenueStats(timeRange);
      console.log('Revenue stats fetched successfully');
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
      errors.revenue = err.message || 'Failed to load revenue stats';
    }

    setLoadingErrors(errors);
    setDataLoaded(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleToggleUserStatus = async (userId) => {
    if (!toggleUserStatus) {
      alert('Toggle user status function not available');
      return;
    }
    if (window.confirm('Are you sure you want to toggle this user\'s status?')) {
      try {
        await toggleUserStatus(userId);
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Failed to toggle user status. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!deleteUser) {
      alert('Delete user function not available');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!deleteBook) {
      alert('Delete book function not available');
      return;
    }
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  // Safe data access with defaults
  const safeStats = {
    totalUsers: stats?.totalUsers ?? 0,
    totalBooks: stats?.totalBooks ?? 0,
    totalTransactions: stats?.totalTransactions ?? 0,
    totalRevenue: stats?.totalRevenue ?? 0,
    activeTransactions: stats?.activeTransactions ?? 0,
    pendingRequests: stats?.pendingRequests ?? 0,
    booksByType: stats?.booksByType ?? {
      SWAP: 0,
      BORROW: 0,
      RENT: 0,
      DONATE: 0
    },
    transactionsByStatus: stats?.transactionsByStatus ?? {
      PENDING: 0,
      APPROVED: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0
    },
    recentUsers: stats?.recentUsers ?? [],
    recentTransactions: stats?.recentTransactions ?? [],
    popularCategories: stats?.popularCategories ?? []
  };

  // Chart configurations with safe data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [6500, 8900, 12000, 15000, 18000, 22000, 25000, 28000, 31000, 34000, 38000, 42000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const transactionChartData = {
    labels: ['Pending', 'Approved', 'Active', 'Completed', 'Rejected', 'Cancelled'],
    datasets: [
      {
        label: 'Transactions',
        data: [
          safeStats.transactionsByStatus.PENDING ?? 0,
          safeStats.transactionsByStatus.APPROVED ?? 0,
          safeStats.transactionsByStatus.ACTIVE ?? 0,
          safeStats.transactionsByStatus.COMPLETED ?? 0,
          safeStats.transactionsByStatus.REJECTED ?? 0,
          safeStats.transactionsByStatus.CANCELLED ?? 0
        ],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',   // PENDING - Yellow
          'rgba(59, 130, 246, 0.8)',  // APPROVED - Blue
          'rgba(34, 197, 94, 0.8)',   // ACTIVE - Green
          'rgba(107, 114, 128, 0.8)', // COMPLETED - Gray
          'rgba(239, 68, 68, 0.8)',   // REJECTED - Red
          'rgba(249, 115, 22, 0.8)'   // CANCELLED - Orange
        ],
        borderWidth: 0
      }
    ]
  };

  const booksByTypeData = {
    labels: ['Swap', 'Borrow', 'Rent', 'Donate'],
    datasets: [
      {
        data: [
          safeStats.booksByType.SWAP ?? 0,
          safeStats.booksByType.BORROW ?? 0,
          safeStats.booksByType.RENT ?? 0,
          safeStats.booksByType.DONATE ?? 0
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',  // SWAP - Purple
          'rgba(59, 130, 246, 0.8)',  // BORROW - Blue
          'rgba(34, 197, 94, 0.8)',   // RENT - Green
          'rgba(249, 115, 22, 0.8)'   // DONATE - Orange
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#4B5563',
          font: { size: 12 }
        }
      }
    }
  };

  // Check if any store methods are missing
  const hasMissingMethods = !fetchDashboardStats || !fetchAllUsers || !fetchAllBooks || !fetchAllTransactions || !fetchRevenueStats;

  // Show loading state
  if ((isLoading || !dataLoaded) && !hasMissingMethods && Object.keys(loadingErrors).length === 0) {
    return <LoadingSpinner />;
  }

  // Show missing methods error
  if (hasMissingMethods) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <ServerCrash className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Store Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Admin store is missing required methods. Please check that adminStore.js exports all required functions.
          </p>
          <div className="text-left bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-red-700">
              Missing: {[
                !fetchDashboardStats && 'fetchDashboardStats',
                !fetchAllUsers && 'fetchAllUsers',
                !fetchAllBooks && 'fetchAllBooks',
                !fetchAllTransactions && 'fetchAllTransactions',
                !fetchRevenueStats && 'fetchRevenueStats'
              ].filter(Boolean).join(', ')}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || Object.keys(loadingErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data'}</p>
          
          {Object.keys(loadingErrors).length > 0 && (
            <div className="text-left bg-red-50 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">Details:</p>
              {Object.entries(loadingErrors).map(([key, msg]) => (
                <p key={key} className="text-sm text-red-700 mb-1">• {key}: {msg}</p>
              ))}
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-blue-100">Welcome back, {user?.firstName}! Here's what's happening.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300 bg-white px-4 rounded-t-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Activity size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users size={18} />
            Users Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'books'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BookOpen size={18} />
            Books Management ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp size={18} />
            Transactions ({transactions.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{safeStats.totalUsers}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Users</h3>
                <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{safeStats.totalBooks}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Books</h3>
                <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{safeStats.totalTransactions}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Transactions</h3>
                <p className="text-sm text-green-600 mt-2">↑ 15% from last month</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">₹{safeStats.totalRevenue?.toLocaleString()}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Revenue</h3>
                <p className="text-sm text-green-600 mt-2">↑ 22% from last month</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Revenue Trend</h2>
                  <select
                    value={timeRange}
                    onChange={(e) => {
                      setTimeRange(e.target.value);
                      if (fetchRevenueStats) {
                        fetchRevenueStats(e.target.value).catch(err => 
                          console.error('Error fetching revenue stats:', err)
                        );
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                    <option value="year">Last 12 months</option>
                  </select>
                </div>
                <div className="h-64">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>

              {/* Transaction Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Transaction Status</h2>
                <div className="h-64">
                  <Bar data={transactionChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Books by Type */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Books by Type</h2>
                <div className="h-64">
                  <Doughnut data={booksByTypeData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {safeStats.recentTransactions.length > 0 ? (
                    safeStats.recentTransactions.slice(0, 5).map((tx, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {tx.status === 'COMPLETED' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : tx.status === 'PENDING' ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {tx.book?.title || 'Unknown Book'} - {tx.status || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent transactions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Users Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users
                      .filter(u => 
                        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Toggle status"
                            >
                              {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete user"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Books Management Tab */}
        {activeTab === 'books' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Books Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {books.length > 0 ? (
                    books
                      .filter(b => 
                        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.author?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{book.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.ownerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              book.availabilityType === 'SWAP' ? 'bg-purple-100 text-purple-800' :
                              book.availabilityType === 'BORROW' ? 'bg-blue-100 text-blue-800' :
                              book.availabilityType === 'RENT' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {book.availabilityType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              book.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete book"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No books found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">All Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{tx.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tx.book?.title || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.requester?.firstName} {tx.requester?.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.owner?.firstName} {tx.owner?.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.transactionType === 'SWAP' ? 'bg-purple-100 text-purple-800' :
                            tx.transactionType === 'BORROW' ? 'bg-blue-100 text-blue-800' :
                            tx.transactionType === 'RENT' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            tx.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            tx.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            tx.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                            tx.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {tx.totalAmount ? `₹${tx.totalAmount}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}