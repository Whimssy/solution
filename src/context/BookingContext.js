// src/context/BookingContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState(null);

  const createBooking = useCallback(async (bookingData) => {
    try {
      // Simulate API call
      const newBooking = {
        id: Date.now().toString(),
        ...bookingData,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      setCurrentBooking(newBooking);
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (error) {
      console.error('Booking creation failed:', error);
      throw error;
    }
  }, []);

  const updateBookingStatus = useCallback((bookingId, status) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
    
    if (currentBooking && currentBooking.id === bookingId) {
      setCurrentBooking(prev => ({ ...prev, status }));
    }
  }, [currentBooking]);

  const selectCleaner = useCallback((cleaner) => {
    setSelectedCleaner(cleaner);
  }, []);

  const value = {
    currentBooking,
    bookings,
    selectedCleaner,
    createBooking,
    updateBookingStatus,
    selectCleaner
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};