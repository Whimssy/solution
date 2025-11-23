// src/pages/Booking.js - Updated version
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingForm from '../components/booking/BookingForm';
import { useBooking } from '../context/BookingContext';
import './Booking.css';

const Booking = () => {
  const { selectedCleaner, isLoading, error } = useBooking();
  const navigate = useNavigate();

  // Add debug logs
  console.log('🔍 Booking Page - Selected Cleaner:', selectedCleaner);

  if (isLoading) {
    return (
      <div className="booking-loading">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-error">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => navigate('/search')} className="btn-secondary">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Complete Your Booking</h1>
          <p>Finalize your cleaning service details</p>
        </div>

        {selectedCleaner ? (
          <div className="booking-content">
            <div className="selected-cleaner-card">
              <div className="cleaner-avatar">
                {selectedCleaner.name?.charAt(0) || 'C'}
              </div>
              <div className="cleaner-details">
                <h3>{selectedCleaner.name}</h3>
                <div className="cleaner-meta">
                  <span className="rating">⭐ {selectedCleaner.rating || '5.0'}</span>
                  <span className="location">📍 {selectedCleaner.location || 'Nairobi'}</span>
                  {selectedCleaner.price && (
                    <span className="price">KES {selectedCleaner.price}/hr</span>
                  )}
                </div>
                <p className="cleaner-bio">
                  {selectedCleaner.description || 'Professional cleaner ready to serve you!'}
                </p>
              </div>
            </div>
            
            <div className="booking-form-section">
              <BookingForm cleanerId={selectedCleaner.id} />
            </div>
          </div>
        ) : (
          <div className="no-cleaner-selected">
            <div className="empty-state">
              <div className="empty-icon">🧹</div>
              <h2>No Cleaner Selected</h2>
              <p>Please select a cleaner from the search page to continue with your booking.</p>
              <Link to="/search" className="btn-primary">
                Find a Cleaner
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;