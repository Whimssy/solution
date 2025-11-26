import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/Routes/ProtectedRoute';
import AdminRoute from './components/auth/Routes/AdminRoute';
import Login from './pages/Login';
import CleanerSearch from './pages/CleanerSearch';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ReferralPage from './pages/ReferralPage';
import CleanerRegistration from './components/auth/CleanerRegistration/CleanerRegistration';
import Dashboard from './pages/Dashboard';
import CleanerProfile from './pages/CleanerProfile';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Show navbar for all routes except admin */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected Client Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <CleanerSearch />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cleaner/:cleanerId" 
                element={
                  <ProtectedRoute>
                    <CleanerProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/book/:cleanerId" 
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/:bookingId" 
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/referrals" 
                element={
                  <ProtectedRoute>
                    <ReferralPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/become-cleaner" 
                element={
                  <ProtectedRoute>
                    <CleanerRegistration />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* Fallback - Redirect to appropriate dashboard */}
              <Route path="*" element={<NavigateToAppropriateDashboard />} />
            </Routes>
          </main>

          {/* Show footer for all routes except admin */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect users to appropriate dashboard
function NavigateToAppropriateDashboard() {
  // Try to get user from localStorage
  const userStr = localStorage.getItem('madeasy_user');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'admin' || user.role === 'super_admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  // Default redirect to home
  return <Navigate to="/" replace />;
}

export default App;