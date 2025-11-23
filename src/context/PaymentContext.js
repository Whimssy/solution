// src/context/PaymentContext.js
import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock payment service - simulates successful payments
  const PaymentService = {
    processPayment: async (paymentData) => {
      console.log('Processing payment:', paymentData);
      
      // Simulate API call delay
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate successful payment 90% of the time
          const isSuccess = Math.random() > 0.1;
          
          if (isSuccess) {
            resolve({
              status: 'success',
              transactionId: 'TXN_' + Date.now(),
              receiptUrl: '#',
              method: paymentData.method,
              amount: paymentData.amount,
              timestamp: new Date().toISOString()
            });
          } else {
            reject(new Error('Payment processing failed. Please try again.'));
          }
        }, 3000);
      });
    },

    verifyPayment: async (transactionId, method) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            status: 'verified',
            transactionId,
            verifiedAt: new Date().toISOString()
          });
        }, 1000);
      });
    }
  };

  const processPayment = async (paymentData) => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      console.log('🔄 Starting payment process...');
      const result = await PaymentService.processPayment(paymentData);
      
      console.log('✅ Payment successful:', result);
      setCurrentTransaction(result);
      setPaymentStatus('success');
      
      return result;
    } catch (error) {
      console.error('❌ Payment failed:', error);
      setPaymentStatus('failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePaymentStatus = async (transactionId) => {
    try {
      const status = await PaymentService.verifyPayment(transactionId);
      setPaymentStatus(status);
      return status;
    } catch (error) {
      setPaymentStatus('failed');
      throw error;
    }
  };

  const resetPayment = () => {
    setPaymentStatus('idle');
    setCurrentTransaction(null);
    setIsProcessing(false);
  };

  return (
    <PaymentContext.Provider value={{
      paymentStatus,
      currentTransaction,
      isProcessing,
      processPayment,
      updatePaymentStatus,
      resetPayment,
      setCurrentTransaction
    }}>
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