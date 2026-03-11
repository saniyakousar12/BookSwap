import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import RequestBookModal from '../components/transactions/RequestBookModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Heart, MapPin, BookOpen, IndianRupee, Repeat, HandHeart, HandCoins } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrowseBooks() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    books,
    categories,
    isLoading,
    currentPage,
    totalPages,
    fetchAllBooks,
    fetchCategories,
    searchBooks,
    fetchBooksByCategory,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    fetchWishlist,
  } = useBookStore();

  const { fetchMyRequests } = useTransactionStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [requestStatus, setRequestStatus] = useState({});
  const [page, setPage] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchAllBooks(page);
      if (user) {
        await fetchWishlist();
        await loadRequestStatus();
      }
    };
    loadInitialData();
  }, []);

  // Update wishlist status when books or wishlist changes
  useEffect(() => {
    if (user) {
      const updateWishlistStatus = () => {
        const newStatus = {};
        books.forEach((book) => {
          newStatus[book.id] = checkInWishlist(book.id);
        });
        setWishlistStatus(newStatus);
      };
      updateWishlistStatus();
    }
  }, [books, user, checkInWishlist]);

  // Load request status for all books
  const loadRequestStatus = async () => {
    try {
      const requests = await fetchMyRequests();
      const statusMap = {};
      requests?.content?.forEach(req => {
        if (['PENDING', 'APPROVED', 'ACTIVE'].includes(req.status)) {
          statusMap[req.book.id] = true;
        }
      });
      setRequestStatus(statusMap);
    } catch (error) {
      console.error('Error loading request status:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setPage(0);
      if (selectedCategory) {
        await searchBooks(searchKeyword, selectedCategory, 0);
      } else {
        await searchBooks(searchKeyword, null, 0);
      }
      if (user) {
        await loadRequestStatus();
      }
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    setPage(0);
    if (category) {
      await fetchBooksByCategory(category, 0);
    } else {
      await fetchAllBooks(0);
    }
    if (user) {
      await loadRequestStatus();
    }
  };

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    if (selectedCategory) {
      await fetchBooksByCategory(selectedCategory, newPage);
    } else if (searchKeyword) {
      await searchBooks(searchKeyword, selectedCategory || null, newPage);
    } else {
      await fetchAllBooks(newPage);
    }
    if (user) {
      await loadRequestStatus();
    }
  };

  const handleWishlist = async (bookId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      if (wishlistStatus[bookId]) {
        await removeFromWishlist(bookId);
        setWishlistStatus((prev) => ({ ...prev, [bookId]: false }));
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(bookId);
        setWishlistStatus((prev) => ({ ...prev, [bookId]: true }));
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleRequestClick = (book, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to request books');
      navigate('/login');
      return;
    }
    setSelectedBook(book);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    loadRequestStatus();
    toast.success('Request sent successfully!');
  };

  // Helper to get availability icon and label
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

  if (isLoading && books.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-md sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <div className="w-64">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-32">
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <button
                onClick={() => handleCategoryFilter('')}
                className={`block w-full text-left px-4 py-2 rounded-lg mb-2 ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                All Books
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`block w-full text-left px-4 py-2 rounded-lg mb-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
                const availability = getAvailabilityBadge(book);
                const isOwner = user?.id === book.ownerId;
                const hasRequested = requestStatus[book.id];
                
                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Book Image */}
                    <div
                      className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative group cursor-pointer"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                          {book.title?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                      
                      {/* Availability Type Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center text-xs ${availability.bg} ${availability.text} px-2 py-1 rounded`}>
                          {availability.icon}
                          {availability.label}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {book.category?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {book.condition || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <MapPin size={14} />
                        {book.ownerName || 'Unknown Owner'}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* Request Button - Show if not owner and book is available */}
                        {!isOwner && book.isAvailable && !hasRequested && (
                          <button
                            onClick={(e) => handleRequestClick(book, e)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <BookOpen size={16} />
                            Request
                          </button>
                        )}

                        {/* Already Requested Message */}
                        {!isOwner && hasRequested && (
                          <div className="flex-1 bg-blue-100 text-blue-800 py-2 px-3 rounded-lg text-sm font-semibold text-center">
                            Requested
                          </div>
                        )}

                        {/* Not Available Message */}
                        {!isOwner && !book.isAvailable && (
                          <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-semibold text-center">
                            Unavailable
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleWishlist(book.id, e)}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center ${
                            wishlistStatus[book.id]
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={wishlistStatus[book.id] ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={18}
                            fill={wishlistStatus[book.id] ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Books Found */}
            {books.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No books found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {selectedBook && (
        <RequestBookModal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}