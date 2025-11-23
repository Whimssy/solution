// src/components/booking/BookingForm.js
import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useNavigate } from 'react-router-dom';

const BookingForm = ({ cleanerId }) => {
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: 2,
    specialInstructions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createBooking, selectedCleaner } = useBooking();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create the booking
      const booking = await createBooking({
        cleanerId,
        cleanerName: selectedCleaner.name,
        cleanerPhoto: selectedCleaner.photo,
        cleanerRating: selectedCleaner.rating,
        ...bookingDetails,
        amount: calculateAmount(bookingDetails.duration)
      });
      
      console.log('Booking created:', booking);
      
      // Navigate to confirmation page
      navigate('/booking-confirmation', { state: { booking } });
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAmount = (duration) => {
    const baseRate = 500; // KSh 500 per hour
    return baseRate * duration;
  };

  const isFormValid = () => {
    return bookingDetails.date && bookingDetails.time;
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h3>Book Cleaning Service</h3>
      
      <div className="form-group">
        <label>Date *</label>
        <input
          type="date"
          value={bookingDetails.date}
          onChange={(e) => setBookingDetails(prev => ({ ...prev, date: e.target.value }))}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label>Time *</label>
        <select
          value={bookingDetails.time}
          onChange={(e) => setBookingDetails(prev => ({ ...prev, time: e.target.value }))}
          required
        >
          <option value="">Select Time</option>
          <option value="08:00">8:00 AM</option>
          <option value="09:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="13:00">1:00 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="16:00">4:00 PM</option>
        </select>
      </div>

      <div className="form-group">
        <label>Duration (hours) *</label>
        <select
          value={bookingDetails.duration}
          onChange={(e) => setBookingDetails(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
        >
          <option value={2}>2 hours - KSh 1,000</option>
          <option value={3}>3 hours - KSh 1,500</option>
          <option value={4}>4 hours - KSh 2,000</option>
          <option value={5}>5 hours - KSh 2,500</option>
        </select>
      </div>

      <div className="form-group">
        <label>Special Instructions</label>
        <textarea
          value={bookingDetails.specialInstructions}
          onChange={(e) => setBookingDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
          placeholder="Any special requirements or instructions for the cleaner..."
          rows={3}
        />
      </div>

      <div className="booking-summary">
        <h4>Booking Summary</h4>
        <div className="summary-item">
          <span>Duration:</span>
          <span>{bookingDetails.duration} hours</span>
        </div>
        <div className="summary-item">
          <span>Rate:</span>
          <span>KSh 500/hour</span>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <span>KSh {calculateAmount(bookingDetails.duration)}</span>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn-primary"
        disabled={!isFormValid() || isSubmitting}
      >
        {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
};

export default BookingForm;