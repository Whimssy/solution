// src/services/paymentService.js
export const processPayment = async (paymentData) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock successful payment
  return {
    status: 'success',
    transactionId: 'txn_' + Date.now(),
    receiptUrl: '#'
  };
};