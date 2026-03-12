import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  Check, X, Clock, Calendar, User, BookOpen, 
  IndianRupee, AlertCircle, Eye 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    myRequests,
    receivedRequests,
    pendingRequests,
    isLoading,
    fetchMyRequests,
    fetchReceivedRequests,
    fetchPendingRequests,
    approveRequest,
    rejectRequest,
    startTransaction,
    completeTransaction,
    cancelRequest
  } = useTransactionStore();

  const [activeTab, setActiveTab] = useState('received'); // received, sent, pending
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchMyRequests(),
        fetchReceivedRequests(),
        fetchPendingRequests()
      ]);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: Clock, 
        label: 'Pending' 
      },
      APPROVED: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: Check, 
        label: 'Approved' 
      },
      ACTIVE: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: BookOpen, 
        label: 'Active' 
      },
      COMPLETED: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: Check, 
        label: 'Completed' 
      },
      REJECTED: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: X, 
        label: 'Rejected' 
      },
      CANCELLED: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800', 
        icon: X, 
        label: 'Cancelled' 
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const handleApprove = async (transactionId) => {
    setProcessingId(transactionId);
    try {
      await approveRequest(transactionId);
      toast.success('Request approved!');
    } catch (error) {
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (transactionId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    
    setProcessingId(transactionId);
    try {
      await rejectRequest(transactionId);
      toast.success('Request rejected');
    } catch (error) {
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStart = async (transactionId) => {
    setProcessingId(transactionId);
    try {
      await startTransaction(transactionId);
      toast.success('Transaction started!');
    } catch (error) {
      toast.error(error.message || 'Failed to start transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (transactionId) => {
    if (!window.confirm('Has the book been successfully exchanged?')) return;
    
    setProcessingId(transactionId);
    try {
      await completeTransaction(transactionId);
      toast.success('Transaction completed!');
    } catch (error) {
      toast.error(error.message || 'Failed to complete transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (transactionId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    setProcessingId(transactionId);
    try {
      await cancelRequest(transactionId);
      toast.success('Request cancelled');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel request');
    } finally {
      setProcessingId(null);
    }
  };

  const renderTransactionCard = (transaction, type) => {
    const isOwner = type === 'received' || type === 'pending';
    const otherUser = isOwner ? transaction.requester : transaction.owner;
    const isProcessing = processingId === transaction.id;

    return (
      <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg mb-1">{transaction.book?.title}</h3>
            <p className="text-gray-600 text-sm">by {transaction.book?.author}</p>
          </div>
          {getStatusBadge(transaction.status)}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <User size={14} />
          <span>
            {isOwner ? 'Requested by: ' : 'Owner: '}
            {otherUser?.firstName} {otherUser?.lastName}
          </span>
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {transaction.transactionType}
            </span>
            {transaction.transactionType === 'RENT' && transaction.totalAmount > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <IndianRupee size={12} />
                ₹{transaction.totalAmount}
              </span>
            )}
          </div>

          {transaction.requestMessage && (
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
              "{transaction.requestMessage}"
            </p>
          )}

          {transaction.endDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              <span>Return by: {new Date(transaction.endDate).toLocaleDateString()}</span>
            </div>
          )}

          {transaction.actualReturnDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check size={14} className="text-green-600" />
              <span>Returned: {new Date(transaction.actualReturnDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {/* Owner Actions */}
          {isOwner && transaction.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(transaction.id)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : (
                  <>
                    <Check size={16} />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={() => handleReject(transaction.id)}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? '...' : (
                  <>
                    <X size={16} />
                    Reject
                  </>
                )}
              </button>
            </>
          )}

          {/* Both parties can start when approved */}
          {transaction.status === 'APPROVED' && (
            <button
              onClick={() => handleStart(transaction.id)}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Start Transaction'}
            </button>
          )}

          {/* Both parties can complete when active */}
          {transaction.status === 'ACTIVE' && (
            <button
              onClick={() => handleComplete(transaction.id)}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Mark as Completed'}
            </button>
          )}

          {/* Requester can cancel pending/approved requests */}
          {!isOwner && (transaction.status === 'PENDING' || transaction.status === 'APPROVED') && (
            <button
              onClick={() => handleCancel(transaction.id)}
              disabled={isProcessing}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Cancel Request'}
            </button>
          )}

          {/* View Details Button */}
          <button
            onClick={() => navigate(`/book/${transaction.book?.id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 flex items-center justify-center gap-1"
          >
            <Eye size={16} />
            View
          </button>
        </div>
      </div>
    );
  };

  if (isLoading && !myRequests.length && !receivedRequests.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Book Requests</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300 overflow-x-auto">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'received'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'sent'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Requests ({myRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'received' && (
            <div>
              {receivedRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No requests received</h3>
                  <p className="text-gray-600">When someone requests your books, they'll appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {receivedRequests.map(tx => renderTransactionCard(tx, 'received'))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No pending requests</h3>
                  <p className="text-gray-600">All caught up!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingRequests.map(tx => renderTransactionCard(tx, 'pending'))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              {myRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No requests sent</h3>
                  <p className="text-gray-600 mb-4">Browse books and request ones you're interested in!</p>
                  <button
                    onClick={() => navigate('/browse-books')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Browse Books
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myRequests.map(tx => renderTransactionCard(tx, 'sent'))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}