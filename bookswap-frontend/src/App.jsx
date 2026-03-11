import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Book Pages (Module 2)
import BrowseBooks from './pages/BrowseBooks';
import BookDetail from './pages/BookDetail';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard'; // Make sure this import exists
import RequestsPage from './pages/RequestsPage';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Books - Public */}
        <Route path="/browse-books" element={<BrowseBooks />} />
        <Route path="/book/:id" element={<BookDetail />} />

        {/* Books - Protected */}
        <Route
          path="/add-book"
          element={
            <ProtectedRoute>
              <AddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-book/:id"
          element={
            <ProtectedRoute>
              <EditBook />
            </ProtectedRoute>
          }
        />
        
        {/* User Dashboard - Regular users only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* My Books - Alias for dashboard */}
        <Route
          path="/my-books"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Dashboard - Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Requests Page */}
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div className="text-center py-20">Page not found</div>} />
      </Routes>
    </Router>
  );
}