import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Heart, Trash2, Edit, IndianRupee, Repeat, HandHeart, HandCoins } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useBookStore } from '../store/bookStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    books = [],
    wishlist = [],
    isLoading,
    fetchUserBooks,
    fetchWishlist,
    deleteBook,
    removeFromWishlist,
  } = useBookStore();

  const [activeTab, setActiveTab] = useState('myBooks');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserBooks();
    fetchWishlist();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      await removeFromWishlist(bookId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getAvailabilityBadge = (book) => {
    switch(book?.availabilityType) {
      case 'SWAP':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: <Repeat size={14} className="mr-1" />,
          label: 'Swap'
        };
      case 'BORROW':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: <HandHeart size={14} className="mr-1" />,
          label: 'Borrow'
        };
      case 'RENT':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: <IndianRupee size={14} className="mr-1" />,
          label: `Rent - ₹${book.rentalPricePerDay}/day`
        };
      case 'DONATE':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: <HandCoins size={14} className="mr-1" />,
          label: 'Donate'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: null,
          label: book?.availabilityType || 'Unknown'
        };
    }
  };

  if (isLoading && books.length === 0 && wishlist.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
              <p className="text-blue-100">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/browse-books')}
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse All Books
            </button>
            <button
              onClick={() => navigate('/add-book')}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={20} />
              Add New Book
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('myBooks')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'myBooks'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Books ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Heart size={20} />
            Wishlist ({wishlist.length})
          </button>
        </div>

        {/* My Books Tab */}
        {activeTab === 'myBooks' && (
          <div>
            {books.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  No books yet!
                </h3>
                <p className="text-gray-600 mb-6">
                  Start sharing your books with the community.
                </p>
                <button
                  onClick={() => navigate('/add-book')}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Add Your First Book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => {
                  const availability = getAvailabilityBadge(book);
                  
                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Book Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600">
                        {book.imageUrl && (
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{book.author}</p>

                        {/* Availability Badge */}
                        <div className="mb-2">
                          <span className={`inline-flex items-center text-xs ${availability.bg} ${availability.text} px-2 py-1 rounded`}>
                            {availability.icon}
                            {availability.label}
                          </span>
                        </div>

                        <div className="mb-4">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {book.category?.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ml-2 ${
                              book.isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {book.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/book/${book.id}`)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/edit-book/${book.id}`)}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  Wishlist is empty!
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some books to your wishlist to keep track of books you want.
                </p>
                <button
                  onClick={() => navigate('/browse-books')}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => {
                  const availability = getAvailabilityBadge(item.book);
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Book Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative group cursor-pointer">
                        {item.book?.imageUrl && (
                          <img
                            src={item.book.imageUrl}
                            alt={item.book.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/book/${item.book?.id}`)}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">
                          {item.book?.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {item.book?.author}
                        </p>
                        
                        {/* Availability Badge */}
                        <div className="mb-2">
                          <span className={`inline-flex items-center text-xs ${availability.bg} ${availability.text} px-2 py-1 rounded`}>
                            {availability.icon}
                            {availability.label}
                          </span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.book?.category?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {item.book?.condition}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                          By {item.book?.ownerName}
                        </p>

                        {/* Action Buttons */}
                        <button
                          onClick={() => handleRemoveFromWishlist(item.book?.id)}
                          className="w-full py-2 px-4 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 flex items-center justify-center gap-2"
                        >
                          <Heart size={18} fill="currentColor" />
                          Remove from Wishlist
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}