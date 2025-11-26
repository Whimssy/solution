// src/components/booking/BookingForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ FIXED: Correct import path
import { useBooking } from '../../../context/BookingContext';
import './BookingForm.css';

const BookingForm = ({ cleanerId }) => {
  const navigate = useNavigate();
  const { selectedCleaner } = useBooking();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    service: 'Standard Cleaning',
    date: '',
    time: '10:00 AM',
    duration: 2,
    address: '',
    location: '',
    instructions: '',
    phoneNumber: ''
  });

  // Nairobi areas for location dropdown
  const nairobiAreas = [
    'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Runda', 
    'Kileleshwa', 'Parklands', 'Upper Hill', 'CBD', 'South B',
    'South C', 'Embakasi', 'Donholm', 'Buruburu', 'Umoja',
    'Kasarani', 'Roysambu', 'Ruaka', 'Thika Road', 'Ngong Road'
  ];

  // ✅ Create booking (without payment)
  const createBooking = async (bookingData) => {
    console.log('📦 Creating booking record...', bookingData);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      booking: {
        bookingId: `BK${Date.now()}`,
        ...bookingData,
        cleaner: selectedCleaner || {
          name: 'Jane Wanjiku',
          phone: '+254712345678',
          rating: '4.8'
        },
        status: 'pending_payment',
        timestamp: new Date().toISOString()
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.date || !formData.address || !formData.phoneNumber || !formData.location) {
        throw new Error('Please fill in all required fields');
      }

      console.log('1. Creating booking record...');

      const bookingData = {
        service: formData.service,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        total: formData.duration * 1200,
        address: formData.address,
        location: formData.location,
        instructions: formData.instructions,
        phoneNumber: formData.phoneNumber,
        cleanerId: cleanerId,
        customer: {
          name: 'John Doe',
          phone: formData.phoneNumber
        }
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        console.log('✅ Booking created - navigating to payment');
        
        // ✅ Navigate to standalone payment page
        navigate('/payment', { 
          state: { 
            booking: result.booking
          }
        });
      } else {
        throw new Error('Failed to create booking');
      }

    } catch (error) {
      console.error('❌ Booking creation error:', error);
      setError(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total
  const totalAmount = formData.duration * 1200;

  return (
    <div className="booking-form">
      <div className="booking-header">
        <h2>Complete Your Booking</h2>
        <p>Enter your details to create the booking</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label>Service Type *</label>
            <select 
              name="service" 
              value={formData.service} 
              onChange={handleInputChange}
              required
            >
              <option value="Standard Cleaning">Standard Cleaning</option>
              <option value="Deep Cleaning">Deep Cleaning</option>
              <option value="Office Cleaning">Office Cleaning</option>
              <option value="Move In/Out Cleaning">Move In/Out Cleaning</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Time *</label>
              <select 
                name="time" 
                value={formData.time} 
                onChange={handleInputChange}
                required
              >
                <option value="08:00 AM">8:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">2:00 PM</option>
                <option value="04:00 PM">4:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Duration (hours) *</label>
            <select 
              name="duration" 
              value={formData.duration} 
              onChange={handleInputChange}
              required
            >
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
              <option value={5}>5 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location/Area *</label>
            <select 
              name="location" 
              value={formData.location} 
              onChange={handleInputChange}
              required
            >
              <option value="">Select your area</option>
              {nairobiAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Full Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="House number, street, apartment details..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+254712345678"
              required
            />
          </div>

          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Any special requirements or instructions for the cleaner..."
              rows="3"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Service:</span>
            <span>{formData.service}</span>
          </div>
          <div className="summary-item">
            <span>Duration:</span>
            <span>{formData.duration} hours</span>
          </div>
          <div className="summary-item">
            <span>Rate:</span>
            <span>KES 1,200/hour</span>
          </div>
          <div className="summary-total">
            <strong>Total Amount:</strong>
            <strong>KES {totalAmount}</strong>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Creating Booking...
            </>
          ) : (
            'Continue to Payment'
          )}
        </button>

        <div className="debug-info">
          <small>🔧 Will navigate to standalone payment page</small>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;