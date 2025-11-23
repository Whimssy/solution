// src/pages/BookingConfirmation.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const navigate = useLocation();
  const location = useLocation();
  const { clearSelectedCleaner } = useBooking();

  const booking = location.state?.booking || {
    bookingId: `BK${Date.now()}`,
    service: 'Standard Cleaning',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: 2,
    total: 2400,
    cleaner: {
      name: 'Jane Wanjiku',
      phone: '+254712345678',
      rating: '4.8'
    },
    address: '123 Main St, Nairobi',
    payment: {
      status: 'success',
      transactionId: `TXN${Date.now()}`,
      method: 'mpesa'
    }
  };

  const handleNewBooking = () => {
    clearSelectedCleaner();
    navigate('/search');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p>Your cleaning service has been scheduled successfully</p>
          <div className="booking-id">Booking ID: #{booking.bookingId}</div>
        </div>

        <div className="confirmation-content">
          {/* Booking Details */}
          <div className="booking-details-card">
            <h3>📅 Booking Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Service Type:</span>
                <span className="value">{booking.service}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date & Time:</span>
                <span className="value">{formatDate(booking.date)} at {booking.time}</span>
              </div>
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">{booking.duration} hours</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Amount:</span>
                <span className="value amount">KES {booking.total}</span>
              </div>
              <div className="detail-item full-width">
                <span className="label">Address:</span>
                <span className="value">{booking.address}</span>
              </div>
            </div>
          </div>

          {/* Cleaner Information */}
          <div className="cleaner-info-card">
            <h3>🧹 Your Cleaner</h3>
            <div className="cleaner-details">
              <div className="cleaner-avatar">
                {booking.cleaner.name.charAt(0)}
              </div>
              <div className="cleaner-info">
                <h4>{booking.cleaner.name}</h4>
                <div className="cleaner-meta">
                  <span className="rating">⭐ {booking.cleaner.rating}</span>
                  <span className="phone">📞 {booking.cleaner.phone}</span>
                </div>
                <p className="cleaner-note">
                  Your cleaner will contact you before the scheduled time
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="payment-info-card">
            <h3>💰 Payment Summary</h3>
            <div className="payment-details">
              <div className="payment-item">
                <span className="label">Payment Method:</span>
                <span className="value">{booking.payment.method.toUpperCase()}</span>
              </div>
              <div className="payment-item">
                <span className="label">Transaction ID:</span>
                <span className="value">{booking.payment.transactionId}</span>
              </div>
              <div className="payment-item">
                <span className="label">Status:</span>
                <span className="value status-success">✅ Paid</span>
              </div>
              <div className="payment-item">
                <span className="label">Amount Paid:</span>
                <span className="value amount">KES {booking.total}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps-card">
            <h3>📋 What Happens Next?</h3>
            <div className="steps-list">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Confirmation Call</strong>
                  <p>Your cleaner will call you 24 hours before the appointment</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Preparation</strong>
                  <p>Ensure access to your home and secure any valuables</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Service Day</strong>
                  <p>Be available to welcome the cleaner and provide instructions</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Feedback</strong>
                  <p>Rate your experience after the service is completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <button className="btn-secondary" onClick={handleNewBooking}>
              Book Another Service
            </button>
            <button className="btn-outline" onClick={handleViewBookings}>
              View My Bookings
            </button>
            <button className="btn-primary">
              📧 Email Receipt
            </button>
          </div>

          {/* Support Information */}
          <div className="support-card">
            <h4>Need Help?</h4>
            <p>Contact our support team for any questions about your booking</p>
            <div className="support-contacts">
              <div className="contact-item">
                <span className="icon">📞</span>
                <span>+254 700 123 456</span>
              </div>
              <div className="contact-item">
                <span className="icon">📧</span>
                <span>support@mamafua.com</span>
              </div>
              <div className="contact-item">
                <span className="icon">💬</span>
                <span>Live Chat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;