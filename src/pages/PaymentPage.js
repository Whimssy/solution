import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking from localStorage
    const bookings = JSON.parse(localStorage.getItem('madeasy_bookings') || '[]');
    const currentBooking = bookings.find(b => b.id === bookingId);
    
    if (currentBooking) {
      setBooking(currentBooking);
    }
    setLoading(false);
  }, [bookingId]);

  const handlePayment = async () => {
    if (!booking) return;
    
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update booking status
      const bookings = JSON.parse(localStorage.getItem('madeasy_bookings') || '[]');
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed', paidAt: new Date().toISOString() } : b
      );
      localStorage.setItem('madeasy_bookings', JSON.stringify(updatedBookings));
      
      // Redirect to success page or dashboard
      alert('Payment successful! Your booking has been confirmed.');
      navigate('/');
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Loading payment details...</div>;
  if (!booking) return <div className="error">Booking not found</div>;

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1>Complete Payment</h1>
          <p>Secure payment for your cleaning service</p>
        </div>

        <div className="payment-content">
          <div className="booking-details">
            <h3>Booking Summary</h3>
            <div className="details-card">
              <div className="detail-row">
                <span>Cleaner:</span>
                <span>{booking.cleanerName}</span>
              </div>
              <div className="detail-row">
                <span>Service:</span>
                <span>{booking.serviceType}</span>
              </div>
              <div className="detail-row">
                <span>Date & Time:</span>
                <span>{booking.date} at {booking.time}</span>
              </div>
              <div className="detail-row">
                <span>Duration:</span>
                <span>{booking.duration} hours</span>
              </div>
              <div className="detail-row">
                <span>Address:</span>
                <span className="address">{booking.address}</span>
              </div>
              <div className="detail-row total">
                <span>Total Amount:</span>
                <span>KSh {booking.total}</span>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="method-options">
              <label className={`method-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <div className="method-icon">📱</div>
                  <div className="method-info">
                    <h4>M-Pesa</h4>
                    <p>Pay via M-Pesa mobile money</p>
                  </div>
                </div>
              </label>

              <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <h4>Credit/Debit Card</h4>
                    <p>Pay with Visa or Mastercard</p>
                  </div>
                </div>
              </label>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="mpesa-instructions">
                <h4>M-Pesa Payment Instructions</h4>
                <ol>
                  <li>Click "Pay with M-Pesa" below</li>
                  <li>Check your phone for M-Pesa prompt</li>
                  <li>Enter your M-Pesa PIN when prompted</li>
                  <li>Wait for payment confirmation</li>
                </ol>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="card-instructions">
                <h4>Card Payment</h4>
                <p>You will be redirected to our secure payment gateway to complete your transaction.</p>
              </div>
            )}

            <button 
              onClick={handlePayment}
              disabled={processing}
              className={`pay-btn ${processing ? 'processing' : ''}`}
            >
              {processing ? (
                <>
                  <div className="spinner"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay KSh ${booking.total}`
              )}
            </button>

            <div className="security-notice">
              <div className="lock-icon">🔒</div>
              <p>Your payment is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;