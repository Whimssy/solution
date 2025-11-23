// src/pages/Bookings.js
import React from 'react';
import './Bookings.css';

const Bookings = () => {
  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>View your booking history and manage appointments</p>
        </div>
        <div className="bookings-content">
          <p>Your booking history will appear here.</p>
          {/* We'll add the booking list functionality later */}
        </div>
      </div>
    </div>
  );
};

export default Bookings;