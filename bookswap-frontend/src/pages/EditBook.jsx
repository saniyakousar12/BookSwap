import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedBook, 
    fetchBook, 
    updateBook, 
    categories = [], 
    fetchCategories, 
    isLoading 
  } = useBookStore();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publicationYear: new Date().getFullYear(),
    condition: 'GOOD',
    description: '',
    language: 'English',
    imageUrl: '',
    availabilityType: 'SWAP',
    rentalPricePerDay: '',
  });

  const [error, setError] = useState('');

  // Load book data and categories
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchBook(id);
    };
    loadData();
  }, [id]);

  // Populate form when book data is loaded
  useEffect(() => {
    if (selectedBook) {
      setFormData({
        title: selectedBook.title || '',
        author: selectedBook.author || '',
        isbn: selectedBook.isbn || '',
        category: selectedBook.category || '',
        publicationYear: selectedBook.publicationYear || new Date().getFullYear(),
        condition: selectedBook.condition || 'GOOD',
        description: selectedBook.description || '',
        language: selectedBook.language || 'English',
        imageUrl: selectedBook.imageUrl || '',
        availabilityType: selectedBook.availabilityType || 'SWAP',
        rentalPricePerDay: selectedBook.rentalPricePerDay || '',
      });
    }
  }, [selectedBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.author || !formData.isbn || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate rental price if type is RENT
    if (formData.availabilityType === 'RENT') {
      if (!formData.rentalPricePerDay || parseFloat(formData.rentalPricePerDay) <= 0) {
        setError('Please enter a valid rental price per day');
        return;
      }
    }

    // Prepare data for API
    const bookData = {
      ...formData,
      rentalPricePerDay: formData.availabilityType === 'RENT' 
        ? parseFloat(formData.rentalPricePerDay) 
        : null,
    };

    try {
      await updateBook(id, bookData);
      navigate(`/book/${id}`); // Navigate to book details after update
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update book. Please try again.');
    }
  };

  if (isLoading && !selectedBook) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Edit Book</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                ISBN *
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Year */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Publication Year *
              </label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>

            {/* Availability Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Availability Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['SWAP', 'BORROW', 'RENT', 'DONATE'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.availabilityType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availabilityType"
                      value={type}
                      checked={formData.availabilityType === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rental Price - Only show when RENT is selected */}
            {formData.availabilityType === 'RENT' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Rental Price (per day) * (₹)
                </label>
                <input
                  type="number"
                  name="rentalPricePerDay"
                  value={formData.rentalPricePerDay}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.availabilityType === 'RENT'}
                />
              </div>
            )}

            {/* Language */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update Book'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}