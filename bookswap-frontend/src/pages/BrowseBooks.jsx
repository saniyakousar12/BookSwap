import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useSearchStore } from '../store/searchStore';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import RequestBookModal from '../components/transactions/RequestBookModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Heart, MapPin, BookOpen, IndianRupee, Repeat, HandHeart, HandCoins, Filter, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api'; // IMPORT API

const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
const availabilityTypes = ['SWAP', 'BORROW', 'RENT', 'DONATE'];

export default function BrowseBooks() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useBookStore();
  const {
    searchResults,
    totalPages,
    currentPage,
    isLoading: searchLoading,
    priceRange,
    advancedSearch,
    simpleSearch,
    clearSearch,
    setSearchResults // Make sure this exists in your store
  } = useSearchStore();

  const { addToWishlist, removeFromWishlist, checkInWishlist, fetchWishlist } = useBookStore();
  const { fetchMyRequests } = useTransactionStore();

  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [localLoading, setLocalLoading] = useState(false); // Add local loading state
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    availabilityType: '',
    minPrice: '',
    maxPrice: '',
    availableOnly: true,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  });

  const [wishlistStatus, setWishlistStatus] = useState({});
  const [requestStatus, setRequestStatus] = useState({});
  const [page, setPage] = useState(0);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await performSearch(0);
      if (user) {
        await fetchWishlist();
        await loadRequestStatus();
      }
    };
    loadInitialData();
  }, []);

  // Update wishlist status when results change
  useEffect(() => {
    if (user && searchResults.length > 0) {
      const updateWishlistStatus = () => {
        const newStatus = {};
        searchResults.forEach((book) => {
          newStatus[book.id] = checkInWishlist(book.id);
        });
        setWishlistStatus(newStatus);
      };
      updateWishlistStatus();
    }
  }, [searchResults, user]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // FIXED performSearch function
  const performSearch = async (pageNum = 0) => {
    setLocalLoading(true);
    
    try {
      const hasSearchCriteria = 
        searchKeyword.trim() || 
        filters.category || 
        filters.condition || 
        filters.availabilityType || 
        filters.minPrice || 
        filters.maxPrice;

      if (hasSearchCriteria) {
        // Use advanced search with filters
        const searchParams = {
          keyword: searchKeyword || undefined,
          category: filters.category || undefined,
          condition: filters.condition || undefined,
          availabilityType: filters.availabilityType || undefined,
          minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
          availableOnly: filters.availableOnly,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          page: pageNum,
          size: 12
        };
        
        await advancedSearch(searchParams);
      } else {
        // Fetch all books from the regular books endpoint
        const response = await api.get('/books', {
          params: { page: pageNum, size: 12 }
        });
        
        // Update search store with the results
        if (setSearchResults) {
          setSearchResults({
            content: response.data.content || [],
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0,
            currentPage: response.data.currentPage || pageNum
          });
        } else {
          // Fallback if setSearchResults doesn't exist
          useSearchStore.setState({
            searchResults: response.data.content || [],
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0,
            currentPage: response.data.currentPage || pageNum
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to load books');
    } finally {
      setLocalLoading(false);
    }
    
    setPage(pageNum);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(0);
    await performSearch(0);
  };

  const handleCategoryFilter = async (category) => {
    setFilters(prev => ({ ...prev, category }));
    setPage(0);
    // Small delay to ensure state is updated
    setTimeout(() => performSearch(0), 100);
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      condition: '',
      availabilityType: '',
      minPrice: '',
      maxPrice: '',
      availableOnly: true,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    });
    setSearchKeyword('');
    setPage(0);
    performSearch(0);
  };

  const handlePageChange = async (newPage) => {
    await performSearch(newPage);
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

  if ((searchLoading || localLoading) && searchResults.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-md sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={filters.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>
                        {cond.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability Type
                  </label>
                  <select
                    name="availabilityType"
                    value={filters.availabilityType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {availabilityTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range (₹/day) {priceRange && `- Avg: ₹${priceRange.averagePrice?.toFixed(2)}`}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleInputChange}
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleInputChange}
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="rentalPricePerDay">Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Direction
                  </label>
                  <select
                    name="sortDirection"
                    value={filters.sortDirection}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DESC">Descending</option>
                    <option value="ASC">Ascending</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="availableOnly"
                      checked={filters.availableOnly}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Show only available books</span>
                  </label>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                >
                  <X size={16} />
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => performSearch(0)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Categories (Quick Filter) */}
          <div className="w-64 hidden lg:block">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-32">
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <button
                onClick={() => handleCategoryFilter('')}
                className={`block w-full text-left px-4 py-2 rounded-lg mb-2 ${
                  filters.category === ''
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
                    filters.category === category
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
            {/* Results count */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Found {searchResults.length} books
              </p>
              {(filters.category || filters.condition || filters.availabilityType || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((book) => {
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
                        {/* Request Button */}
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
            {searchResults.length === 0 && !searchLoading && !localLoading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No books found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
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