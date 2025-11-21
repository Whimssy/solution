// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CleanerSearch from './pages/CleanerSearch';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Referral from './pages/Referral';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Styles
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/search" element={<CleanerSearch />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/referral" element={<Referral />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;