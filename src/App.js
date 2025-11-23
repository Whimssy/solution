// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { PaymentProvider } from './context/PaymentContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CleanerSearch from './pages/CleanerSearch';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Referral from './pages/Referral';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Bookings from './pages/Bookings';
import BookingConfirmation from './pages/BookingConfirmation';
import CleanerProfile from './pages/CleanerProfile'; // Add this import

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Styles
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Wrap the entire app with BookingProvider since multiple components use it */}
        <BookingProvider>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/search" element={<CleanerSearch />} />
                <Route path="/bookings" element={<Bookings />} />
                
                {/* Cleaner Profile Route */}
                <Route path="/cleaner/:cleanerId" element={<CleanerProfile />} />
                
                {/* Booking Flow */}
                <Route path="/booking" element={<Booking />} />
                
                <Route path="/payment" element={
                  <PaymentProvider>
                    <Payment />
                  </PaymentProvider>
                } />
                
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                
                {/* Other Protected Routes */}
                <Route path="/referral" element={<Referral />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* 404 Page */}
                <Route path="*" element={
                  <div className="page-not-found">
                    <div className="not-found-container">
                      <h2>404 - Page Not Found</h2>
                      <p>The page you're looking for doesn't exist.</p>
                      <div className="not-found-actions">
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="btn-primary"
                        >
                          Go Home
                        </button>
                        <button 
                          onClick={() => window.history.back()}
                          className="btn-secondary"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;