// src/context/BookingContext.js
import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectCleaner = (cleaner) => {
    console.log('Selecting cleaner:', cleaner); // Debug log
    setSelectedCleaner(cleaner);
    setError(null);
  };

  const clearSelectedCleaner = () => {
    setSelectedCleaner(null);
  };

  return (
    <BookingContext.Provider value={{
      selectedCleaner,
      isLoading,
      error,
      selectCleaner,
      clearSelectedCleaner,
      setLoading: setIsLoading,
      setError
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};