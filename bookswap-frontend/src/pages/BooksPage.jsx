import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, BookOpen, Star, MapPin } from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const BooksPage = () => {
  const navigate = useNavigate();
  const { books, isLoading, fetchBooks, searchBooks, filters, setFilters } = useBookStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    'FICTION', 'NON_FICTION', 'SCIENCE', 'HISTORY', 'BIOGRAPHY',
    'SELF_HELP', 'ROMANCE', 'MYSTERY', 'THRILLER', 'FANTASY'
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      await fetchBooks();
      return;
    }
    try {
      await searchBooks(searchTerm);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleGenreFilter = async (genre) => {
    try {
      setFilters({ ...filters, genre: filters.genre === genre ? '' : genre });
      await fetchBooks(0, { genre: genre !== filters.genre ? genre : '' });
    } catch (error) {
      toast.error('Filter failed');
    }
  };

  const BookCard = ({ book }) => (
    <Card
      hover
      className="overflow-hidden bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 cursor-pointer group"
      onClick={() => navigate(`/books/${book.id}`)}
    >
      {/* Book Image */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 aspect-video rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-blue-400/50 group-hover:text-blue-400 transition-colors" />
        )}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-lg text-white line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
        {book.title}
      </h3>
      <p className="text-gray-400 text-sm mb-3">{book.author}</p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(book.ratingAverage)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">({book.totalRatings || 0})</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 mb-4 text-xs text-gray-400">
        <MapPin className="w-3 h-3" />
        <span>Hyderabad</span>
      </div>

      {/* Status & Price */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            book.status === 'AVAILABLE'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-700/50 text-gray-400'
          }`}
        >
          {book.status}
        </span>
        {book.rentalPrice && (
          <span className="text-blue-400 font-semibold text-sm">
            ₹{book.rentalPrice}/day
          </span>
        )}
      </div>
    </Card>
  );

  return (
    <div className="bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Books</h1>
          <p className="text-gray-300">Discover thousands of books available to swap, borrow, rent, or donate</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              />
            </div>
            <Button type="submit" loading={isLoading} className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center gap-2 text-gray-300"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </form>

          {/* Genre Filters */}
          {showFilters && (
            <div className="border-t border-gray-700 pt-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Genres</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreFilter(genre)}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      filters.genre === genre
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {genre.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Books Grid */}
        {isLoading && books.length === 0 ? (
          <LoadingSpinner fullScreen={false} />
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No books found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filters
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilters({ genre: '', status: 'AVAILABLE' });
                fetchBooks();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};