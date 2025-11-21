// src/pages/Payment.js
import React from 'react';
import PaymentForm from '../components/payment/PaymentForm';
import { useBooking } from '../context/BookingContext';

const Payment = () => {
  const { currentBooking } = useBooking();

  return (
    <div className="payment-page">
      {currentBooking ? (
        <PaymentForm 
          bookingId={currentBooking.id} 
          amount={500} // Example amount
        />
      ) : (
        <div className="no-booking">
          <h2>No Booking Found</h2>
          <p>Please complete a booking first.</p>
        </div>
      )}
    </div>
  );
};

export default Payment;