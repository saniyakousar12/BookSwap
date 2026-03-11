import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut, User, Home, Search, Plus, MessageSquare, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';
import NotificationBell from '../notifications/NotificationBell'; // Add this import

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={handleNavClick}
          >
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary-dark transition-colors">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800 hidden sm:inline">
              BookSwap
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            
            <Link
              to="/browse-books"
              className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Browse Books
            </Link>

            {isLoggedIn() ? (
              <>
                {/* Notification Bell - Placed before other icons */}
                <NotificationBell />
                
                {/* Admin Link - Only visible to admin users */}
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                
                <Link
                  to="/add-book"
                  className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Book
                </Link>
                
                <Link
                  to="/requests"
                  className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Requests
                </Link>
                
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                
                <div className="flex items-center gap-3 border-l pl-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {user?.firstName}
                    </span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    icon={LogOut}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn() && <NotificationBell />}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3 animate-fade-in">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleNavClick}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </div>
            </Link>
            
            <Link
              to="/browse-books"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleNavClick}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Browse Books
              </div>
            </Link>

            {isLoggedIn() ? (
              <>
                {/* Admin Link - Mobile */}
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleNavClick}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </div>
                  </Link>
                )}
                
                <Link
                  to="/add-book"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleNavClick}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Book
                  </div>
                </Link>
                
                <Link
                  to="/requests"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleNavClick}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Requests
                  </div>
                </Link>
                
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleNavClick}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </div>
                </Link>
                
                <div className="px-4 py-2 border-t">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-4 py-2 space-y-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    handleNavClick();
                  }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate('/signup');
                    handleNavClick();
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};