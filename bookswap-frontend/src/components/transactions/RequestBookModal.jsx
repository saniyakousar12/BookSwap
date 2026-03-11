import React, { useState } from 'react';
import { X, Calendar, MessageSquare, IndianRupee } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import toast from 'react-hot-toast';

const RequestBookModal = ({ isOpen, onClose, book }) => {
  const { requestBook, isLoading } = useTransactionStore();
  const [formData, setFormData] = useState({
    bookId: book?.id,
    transactionType: book?.availabilityType || 'SWAP',
    requestMessage: '',
    startDate: '',
    endDate: '',
    rentalDays: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen || !book) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (book.availabilityType === 'BORROW') {
      if (!formData.endDate) {
        newErrors.endDate = 'Return date is required';
      } else {
        const returnDate = new Date(formData.endDate);
        const today = new Date();
        if (returnDate <= today) {
          newErrors.endDate = 'Return date must be in the future';
        }
      }
    }

    if (book.availabilityType === 'RENT') {
      if (!formData.rentalDays || formData.rentalDays <= 0) {
        newErrors.rentalDays = 'Number of rental days is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const requestData = {
      bookId: book.id,
      transactionType: book.availabilityType,
      requestMessage: formData.requestMessage
    };

    // Add date fields based on type
    if (book.availabilityType === 'BORROW') {
      requestData.endDate = new Date(formData.endDate).toISOString();
    } else if (book.availabilityType === 'RENT') {
      requestData.rentalDays = parseInt(formData.rentalDays);
      requestData.startDate = new Date().toISOString();
    }

    try {
      await requestBook(requestData);
      toast.success('Request sent successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

  const getTypeLabel = () => {
    switch (book.availabilityType) {
      case 'SWAP': return 'Swap';
      case 'BORROW': return 'Borrow';
      case 'RENT': return 'Rent';
      case 'DONATE': return 'Donate';
      default: return book.availabilityType;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Request Book</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Book Info */}
        <div className="p-6 bg-blue-50 border-b">
          <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
          <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              {getTypeLabel()}
            </span>
            {book.availabilityType === 'RENT' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ₹{book.rentalPricePerDay}/day
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Message */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <MessageSquare size={16} />
              Message to Owner
            </label>
            <textarea
              name="requestMessage"
              value={formData.requestMessage}
              onChange={handleChange}
              rows="3"
              placeholder="Tell the owner why you want this book..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Optional</p>
          </div>

          {/* Borrow - Return Date */}
          {book.availabilityType === 'BORROW' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Expected Return Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          )}

          {/* Rent - Duration */}
          {book.availabilityType === 'RENT' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <IndianRupee size={16} />
                Rental Duration (days) *
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  name="rentalDays"
                  value={formData.rentalDays}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className={`w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rentalDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="text-gray-600">
                  × ₹{book.rentalPricePerDay} ={' '}
                  <span className="font-bold text-green-600">
                    ₹{formData.rentalDays && formData.rentalDays > 0 
                      ? formData.rentalDays * book.rentalPricePerDay 
                      : 0}
                  </span>
                </span>
              </div>
              {errors.rentalDays && (
                <p className="text-red-500 text-sm mt-1">{errors.rentalDays}</p>
              )}
            </div>
          )}

          {/* Donate/Swap - No extra fields needed */}
          {(book.availabilityType === 'SWAP' || book.availabilityType === 'DONATE') && (
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
              {book.availabilityType === 'SWAP' 
                ? 'You can swap this book with the owner. Discuss details after request is approved.'
                : 'This book is available for donation. Coordinate pickup with the owner.'}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestBookModal;