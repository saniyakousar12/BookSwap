import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useReviewStore } from '../../store/reviewStore';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, book, transaction, onSuccess }) => {
  const { createBookReview, createUserReview, isLoading } = useReviewStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      if (book) {
        // Book review
        await createBookReview({
          bookId: book.id,
          rating,
          comment
        });
        toast.success('Review added successfully!');
      } else if (transaction) {
        // User review (after transaction)
        await createUserReview({
          transactionId: transaction.id,
          rating,
          comment
        });
        toast.success('Rating submitted successfully!');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {book ? 'Write a Review' : 'Rate Your Experience'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {book && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-gray-600">by {book.author}</p>
            </div>
          )}

          {transaction && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg">Transaction #{transaction.id}</h3>
              <p className="text-gray-600">{transaction.book?.title}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors cursor-pointer ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder="Share your thoughts about the book or your experience..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;