// components/booking/BookingForm.js
import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';

const BookingForm = ({ cleanerId }) => {
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: 2,
    specialInstructions: ''
  });
  
  const { createBooking } = useBooking();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking({
        cleanerId,
        ...bookingDetails
      });
      // Navigate to payment page
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h3>Book Cleaning Service</h3>
      
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={bookingDetails.date}
          onChange={(e) => setBookingDetails(prev => ({
            ...prev, date: e.target.value
          }))}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label>Time</label>
        <select
          value={bookingDetails.time}
          onChange={(e) => setBookingDetails(prev => ({
            ...prev, time: e.target.value
          }))}
          required
        >
          <option value="">Select Time</option>
          <option value="09:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="13:00">1:00 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
        </select>
      </div>

      <div className="form-group">
        <label>Duration (hours)</label>
        <select
          value={bookingDetails.duration}
          onChange={(e) => setBookingDetails(prev => ({
            ...prev, duration: parseInt(e.target.value)
          }))}
        >
          <option value={2}>2 hours</option>
          <option value={3}>3 hours</option>
          <option value={4}>4 hours</option>
          <option value={5}>5 hours</option>
        </select>
      </div>

      <div className="form-group">
        <label>Special Instructions</label>
        <textarea
          value={bookingDetails.specialInstructions}
          onChange={(e) => setBookingDetails(prev => ({
            ...prev, specialInstructions: e.target.value
          }))}
          placeholder="Any special requirements or instructions..."
          rows={3}
        />
      </div>

      <button type="submit" className="btn-primary">
        Confirm Booking
      </button>
    </form>
  );
};

export default BookingForm;