import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { useReviewStore } from '../store/reviewStore';
import RequestBookModal from '../components/transactions/RequestBookModal';
import ReviewModal from '../components/reviews/ReviewModal';
import StarRating from '../components/reviews/StarRating';
import { 
  Heart, ChevronLeft, IndianRupee, Repeat, HandHeart, HandCoins, 
  BookOpen, MessageCircle, Star, Users, Clock, CheckCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Book store
  const {
    selectedBook,
    isLoading,
    fetchBook,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    wishlist,
  } = useBookStore();

  // Transaction store
  const { fetchMyRequests } = useTransactionStore();

  // Review store
  const { 
    bookReviews, 
    averageRating, 
    reviewCount,
    fetchBookReviews,
    fetchAverageRating,
    fetchReviewCount,
    createBookReview,
    isLoading: reviewLoading
  } = useReviewStore();

  // Local state
  const [inWishlist, setInWishlist] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  // Fetch book on mount or when id changes
  useEffect(() => {
    fetchBook(id);
  }, [id]);

  // Load reviews when book is loaded
  useEffect(() => {
    if (selectedBook) {
      loadReviews();
      loadRating();
    }
  }, [selectedBook]);

  const loadReviews = async (page = 0) => {
    const data = await fetchBookReviews(selectedBook.id, page, 5);
    if (data) {
      setHasMoreReviews(!data.last);
    }
  };

  const loadRating = async () => {
    await fetchAverageRating(selectedBook.id);
    await fetchReviewCount(selectedBook.id);
  };

  // Check wishlist status whenever selectedBook or wishlist changes
  useEffect(() => {
    if (selectedBook) {
      const isInWishlist = checkInWishlist(id);
      setInWishlist(isInWishlist);
      
      // Check if current user has already reviewed
      if (user) {
        const userReview = bookReviews.find(r => r.reviewer.id === user.id);
        setUserRating(userReview || null);
      }
    }
  }, [selectedBook, wishlist, id, bookReviews, user]);

  // Check if user has already requested this book
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (user && selectedBook) {
        try {
          const requests = await fetchMyRequests();
          const existingRequest = requests?.content?.some(
            req => req.book.id === selectedBook.id && 
                   ['PENDING', 'APPROVED', 'ACTIVE'].includes(req.status)
          );
          setHasRequested(existingRequest);
        } catch (error) {
          console.error('Error checking existing requests:', error);
        }
      }
    };
    checkExistingRequest();
  }, [user, selectedBook]);

  const getAvailabilityInfo = (book) => {
    switch(book?.availabilityType) {
      case 'SWAP':
        return {
          icon: <Repeat className="text-purple-600" size={20} />,
          label: 'Available for Swap',
          bg: 'bg-purple-50',
          text: 'text-purple-800',
          price: null
        };
      case 'BORROW':
        return {
          icon: <HandHeart className="text-blue-600" size={20} />,
          label: 'Available for Borrow',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          price: null
        };
      case 'RENT':
        return {
          icon: <IndianRupee className="text-green-600" size={20} />,
          label: `Available for Rent - ₹${book?.rentalPricePerDay}/day`,
          bg: 'bg-green-50',
          text: 'text-green-800',
          price: book?.rentalPricePerDay
        };
      case 'DONATE':
        return {
          icon: <HandCoins className="text-yellow-600" size={20} />,
          label: 'Available for Donation',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          price: null
        };
      default:
        return {
          icon: null,
          label: 'Availability Unknown',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          price: null
        };
    }
  };

  const handleWishlist = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
      setInWishlist(!inWishlist);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRequestSuccess = () => {
    setHasRequested(true);
    setShowRequestModal(false);
  };

  const handleReviewSuccess = () => {
    loadReviews(0);
    loadRating();
    setShowReviewModal(false);
  };

  const loadMoreReviews = () => {
    const nextPage = reviewsPage + 1;
    setReviewsPage(nextPage);
    loadReviews(nextPage);
  };

  if (isLoading || !selectedBook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  const availabilityInfo = getAvailabilityInfo(selectedBook);
  const isOwner = user?.id === selectedBook.ownerId;
  const canReview = user && !isOwner && !userRating && !reviewLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Books
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            {/* Book Image */}
            <div>
              <div className="h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg overflow-hidden">
                {selectedBook.imageUrl ? (
                  <img
                    src={selectedBook.imageUrl}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {selectedBook.title?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Request Button */}
              {user && !isOwner && selectedBook.isAvailable && !hasRequested && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full mt-4 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen size={20} />
                  Request This Book
                </button>
              )}

              {/* Already Requested Message */}
              {user && !isOwner && hasRequested && (
                <div className="w-full mt-4 py-3 px-4 bg-blue-100 text-blue-800 rounded-lg font-semibold text-center">
                  Request Already Sent
                </div>
              )}

              {/* Not Available Message */}
              {!selectedBook.isAvailable && (
                <div className="w-full mt-4 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg font-semibold text-center">
                  Currently Unavailable
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  inWishlist
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart
                  size={20}
                  fill={inWishlist ? 'currentColor' : 'none'}
                />
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>

              {/* Rating Summary - Mobile */}
              <div className="md:hidden mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-lg">{averageRating}</span>
                    <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
                  </div>
                  {canReview && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-800"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{selectedBook.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {selectedBook.author}</p>

              {/* Availability Type */}
              <div className={`${availabilityInfo.bg} ${availabilityInfo.text} p-4 rounded-lg mb-6 flex items-center gap-3`}>
                {availabilityInfo.icon}
                <span className="font-semibold">{availabilityInfo.label}</span>
              </div>

              {/* Rating Summary - Desktop */}
              <div className="hidden md:flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-800">{averageRating}</span>
                    <span className="text-gray-500">/5</span>
                  </div>
                  <div>
                    <StarRating rating={averageRating} size={20} />
                    <p className="text-sm text-gray-500 mt-1">{reviewCount} reviews</p>
                  </div>
                </div>
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle size={18} />
                    Write a Review
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold">{selectedBook.category?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-semibold">{selectedBook.condition || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Language</p>
                  <p className="font-semibold">{selectedBook.language || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Publication Year</p>
                  <p className="font-semibold">{selectedBook.publicationYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-semibold">{selectedBook.isbn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className={`font-semibold ${selectedBook.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBook.isAvailable ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Posted by</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">{selectedBook.ownerName || 'Unknown'}</p>
                  {!isOwner && (
                    <button
                      onClick={() => navigate(`/profile/${selectedBook.ownerId}`)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </button>
                  )}
                </div>
                {isOwner && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-book/${selectedBook.id}`)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Edit Book
                    </button>
                    <button
                      onClick={() => navigate('/requests')}
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700"
                    >
                      View Requests
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedBook.description && (
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedBook.description}</p>
                </div>
              )}

              {/* Reviews Section */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-bold mb-6">Reviews</h3>
                
                {/* Reviews List */}
                <div className="space-y-6">
                  {bookReviews.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No reviews yet</p>
                      {canReview && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Be the first to review
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {bookReviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {review.reviewer.firstName?.charAt(0)}
                                {review.reviewer.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {review.reviewer.firstName} {review.reviewer.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size={16} />
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mt-2 ml-13">{review.comment}</p>
                          )}
                        </div>
                      ))}
                      
                      {/* Load More Reviews */}
                      {hasMoreReviews && bookReviews.length >= 5 && (
                        <button
                          onClick={loadMoreReviews}
                          className="w-full py-3 text-blue-600 hover:text-blue-800 font-medium border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Load More Reviews
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <RequestBookModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        book={selectedBook}
        onSuccess={handleRequestSuccess}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        book={selectedBook}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}