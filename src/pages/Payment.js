// src/pages/Payment.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';
import { useBooking } from '../context/BookingContext';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processPayment, isProcessing } = usePayment();
  const { selectedCleaner } = useBooking();
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    email: '',
    saveCard: false
  });

  // Get booking data from navigation state or context
  const booking = location.state?.booking || {
    total: 2400,
    service: 'Standard Cleaning',
    duration: 2,
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM'
  };

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '📱',
      description: 'Pay via M-Pesa mobile money',
      fields: ['phoneNumber']
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay with Visa, Mastercard',
      fields: ['cardNumber', 'expiry', 'cvv', 'saveCard']
    },
    {
      id: 'pesapal',
      name: 'Pesapal',
      icon: '🌐',
      description: 'Secure online payment',
      fields: []
    }
  ];

  const handlePayment = async () => {
    try {
      const paymentResult = await processPayment({
        bookingId: `BK${Date.now()}`,
        amount: booking.total,
        method: paymentMethod,
        ...paymentData,
        bookingDetails: booking
      });

      if (paymentResult.status === 'success') {
        navigate('/booking-confirmation', { 
          state: { 
            booking: {
              ...booking,
              payment: paymentResult,
              cleaner: selectedCleaner,
              bookingId: paymentResult.transactionId
            }
          }
        });
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Payment</h1>
          <p>Secure payment for your cleaning service</p>
        </div>

        <div className="payment-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span>Service:</span>
                <span>{booking.service}</span>
              </div>
              <div className="summary-item">
                <span>Cleaner:</span>
                <span>{selectedCleaner?.name || 'Professional Cleaner'}</span>
              </div>
              <div className="summary-item">
                <span>Date & Time:</span>
                <span>{new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
              </div>
              <div className="summary-item">
                <span>Duration:</span>
                <span>{booking.duration} hours</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount:</span>
                <span>KES {booking.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="method-options">
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`method-option ${paymentMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-radio">
                    <div className="radio-dot"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form">
            {paymentMethod === 'mpesa' && (
              <div className="method-form">
                <h4>M-Pesa Payment</h4>
                <p>You will receive a prompt on your phone to complete the payment</p>
                <div className="form-group">
                  <label>M-Pesa Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={paymentData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="07XXXXXXXX"
                    required
                  />
                </div>
                <div className="mpesa-instructions">
                  <h5>How to pay with M-Pesa:</h5>
                  <ol>
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>Click "Pay with M-Pesa"</li>
                    <li>Check your phone for STK push</li>
                    <li>Enter your M-Pesa PIN to complete</li>
                  </ol>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="method-form">
                <h4>Card Payment</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={paymentData.saveCard}
                      onChange={handleInputChange}
                    />
                    Save card for future payments
                  </label>
                </div>
              </div>
            )}

            {paymentMethod === 'pesapal' && (
              <div className="method-form">
                <h4>Pesapal Payment</h4>
                <p>You will be redirected to Pesapal to complete your payment securely</p>
                <div className="pesapal-features">
                  <div className="feature">
                    <span className="icon">🔒</span>
                    <span>Secure payment processing</span>
                  </div>
                  <div className="feature">
                    <span className="icon">💳</span>
                    <span>Multiple payment options</span>
                  </div>
                  <div className="feature">
                    <span className="icon">📧</span>
                    <span>Instant email receipt</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Actions */}
          <div className="payment-actions">
            <button 
              className="btn-secondary"
              onClick={() => navigate('/booking')}
            >
              ← Back to Booking
            </button>
            <button 
              className="btn-primary"
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === 'mpesa' && !paymentData.phoneNumber)}
            >
              {isProcessing ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Processing...
                </>
              ) : (
                `Pay KES ${booking.total}`
              )}
            </button>
          </div>

          {/* Security Badge */}
          <div className="security-badge">
            <div className="lock-icon">🔒</div>
            <div className="security-text">
              <strong>Secure Payment</strong>
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;