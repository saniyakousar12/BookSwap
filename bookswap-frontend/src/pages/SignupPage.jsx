import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedRole, setSelectedRole] = useState('user');
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setServerError('Password must be at least 6 characters');
      return;
    }

    try {
      // Create userData object with ALL required fields
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: selectedRole // This MUST match backend enum (USER or ADMIN)
      };

      console.log('Submitting signup with data:', userData);

      // Call signup with the userData object
      await signup(userData);

      console.log('Signup successful!');
      navigate('/login');
    } catch (err) {
      console.error('Signup failed:', err);
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setServerError(errorMessage);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Create your account
          </h2>
          <p className="text-center text-gray-600 mb-8">
            and start sharing books
          </p>

          {/* Role Selection */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole('user')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                selectedRole === 'user'
                  ? 'bg-blue-600 text-white border-2 border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-600'
              }`}
            >
              👤 User
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-blue-600 text-white border-2 border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-600'
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Error Messages */}
          {(error || serverError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p>{serverError || error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create User Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-700">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}