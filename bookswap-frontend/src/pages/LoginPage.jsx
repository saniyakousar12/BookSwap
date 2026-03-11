import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, user } = useAuthStore();
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      
      // Get the updated user state after login
      const { user: loggedInUser } = useAuthStore.getState();
      
      // Redirect based on user role
      if (loggedInUser?.role === 'ADMIN') {
        navigate('/admin');
        toast.success('Welcome Admin!');
      } else {
        navigate('/dashboard');
        toast.success('Login successful!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your BookSwap account</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl bg-gray-800/50 backdrop-blur border border-gray-700">
          {serverError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-2.5 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-4 py-2.5 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                />
                <span className="text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/signup"
            className="block w-full text-center px-4 py-2.5 border-2 border-gray-600 text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all"
          >
            Create Account
          </Link>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Demo credentials:</strong><br />
            Email: demo@example.com<br />
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;