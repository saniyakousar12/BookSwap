import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/searchStore';
import { useBookStore } from '../store/bookStore';
import { Search, Filter, X, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
const availabilityTypes = ['SWAP', 'BORROW', 'RENT', 'DONATE'];

export default function AdvancedSearchPage() {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useBookStore();
  const {
    searchResults,
    totalPages,
    currentPage,
    isLoading,
    priceRange,
    priceComparisons,
    advancedSearch,
    fetchPriceRange,
    comparePrices,
    clearSearch
  } = useSearchStore();

  const [filters, setFilters] = useState({
    keyword: '',
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    condition: '',
    availabilityType: '',
    minPrice: '',
    maxPrice: '',
    availableOnly: true,
    latitude: '',
    longitude: '',
    maxDistance: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    page: 0,
    size: 20
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchPriceRange();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchParams = {
      ...filters,
      category: filters.category || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      latitude: filters.latitude ? parseFloat(filters.latitude) : undefined,
      longitude: filters.longitude ? parseFloat(filters.longitude) : undefined,
      maxDistance: filters.maxDistance ? parseFloat(filters.maxDistance) : undefined
    };
    
    await advancedSearch(searchParams);
    
    // If category selected, compare prices
    if (filters.category) {
      comparePrices(filters.category, filters.maxDistance);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    handleSearch(newPage);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      category: '',
      condition: '',
      availabilityType: '',
      minPrice: '',
      maxPrice: '',
      availableOnly: true,
      latitude: '',
      longitude: '',
      maxDistance: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      page: 0,
      size: 20
    });
    clearSearch();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Advanced Book Search
          </h1>
          <p className="text-gray-600">
            Find exactly what you're looking for with powerful filters
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleInputChange}
              placeholder="Search by title, author, ISBN..."
              className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <Search size={18} />
              Search
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={filters.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={filters.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={filters.isbn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Publisher
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={filters.publisher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={filters.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>
                        {cond.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability Type
                  </label>
                  <select
                    name="availabilityType"
                    value={filters.availabilityType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {availabilityTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range (for rent) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range (₹/day) {priceRange && `- Avg: ₹${priceRange.averagePrice?.toFixed(2)}`}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleInputChange}
                      placeholder="Min"
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleInputChange}
                      placeholder="Max"
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location (for nearby books)
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      name="latitude"
                      value={filters.latitude}
                      onChange={handleInputChange}
                      placeholder="Latitude"
                      className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="longitude"
                      value={filters.longitude}
                      onChange={handleInputChange}
                      placeholder="Longitude"
                      className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="maxDistance"
                      value={filters.maxDistance}
                      onChange={handleInputChange}
                      placeholder="Max distance (km)"
                      className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                    >
                      <MapPin size={18} />
                      Use My Location
                    </button>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="rentalPricePerDay">Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort Direction
                  </label>
                  <select
                    name="sortDirection"
                    value={filters.sortDirection}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Price Comparison Section */}
        {priceComparisons.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <IndianRupee size={20} className="text-green-600" />
              Best Rental Prices for {filters.category?.replace(/_/g, ' ')}
            </h2>
            <div className="space-y-3">
              {priceComparisons.map((book) => (
                <div
                  key={book.bookId}
                  onClick={() => navigate(`/book/${book.bookId}`)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div>
                    <h3 className="font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                    <p className="text-xs text-gray-500">Owner: {book.ownerName} ⭐ {book.ownerRating?.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₹{book.rentalPricePerDay}</p>
                    <p className="text-xs text-gray-500">per day</p>
                    {book.distance && (
                      <p className="text-xs text-gray-500">{book.distance.toFixed(1)} km away</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : searchResults.length > 0 ? (
            <>
              <p className="text-gray-600">
                Found {totalElements} books
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600">
                      {book.imageUrl && (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {book.category?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {book.condition}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {book.availabilityType}
                        </span>
                      </div>
                      {book.availabilityType === 'RENT' && (
                        <p className="text-sm font-semibold text-green-600">
                          ₹{book.rentalPricePerDay}/day
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No books found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}