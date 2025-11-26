// src/context/PaymentContext.js
import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock payment processing
  const processPayment = async (paymentData) => {
    setIsProcessing(true);
    console.log('💰 Processing payment:', paymentData);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful payment
      const mockPaymentResult = {
        success: true,
        payment: {
          transactionId: `TXN${Date.now()}`,
          method: paymentData.method,
          amount: paymentData.amount,
          status: 'success',
          timestamp: new Date().toISOString(),
          phoneNumber: paymentData.phoneNumber
        }
      };

      console.log('✅ Payment processed successfully:', mockPaymentResult);
      return mockPaymentResult;

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      return {
        success: false,
        message: 'Payment processing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const value = {
    processPayment,
    isProcessing
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};