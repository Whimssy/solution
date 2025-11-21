// src/pages/Booking.js
import React from 'react';
import BookingForm from '../components/booking/BookingForm';
import { useBooking } from '../context/BookingContext';

const Booking = () => {
  const { selectedCleaner } = useBooking();

  return (
    <div className="booking-page">
      <h2>Book Cleaning Service</h2>
      {selectedCleaner ? (
        <>
          <div className="selected-cleaner-info">
            <h3>Booking with {selectedCleaner.name}</h3>
            <p>Rating: {selectedCleaner.rating} ★</p>
            <p>Location: {selectedCleaner.location}</p>
          </div>
          <BookingForm cleanerId={selectedCleaner.id} />
        </>
      ) : (
        <div className="no-cleaner-selected">
          <h2>No Cleaner Selected</h2>
          <p>Please go to the search page and select a cleaner first.</p>
          <a href="/search" className="btn-primary">Find Cleaners</a>
        </div>
      )}
    </div>
  );
};

export default Booking;