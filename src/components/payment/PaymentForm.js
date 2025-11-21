// components/payment/PaymentForm.js
import React, { useState } from 'react';
import { processPayment } from '../../services/paymentService';

const PaymentForm = ({ bookingId, amount }) => {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const result = await processPayment({
        bookingId,
        amount,
        method: paymentMethod
      });
      
      if (result.status === 'success') {
        // Show success message and redirect
        alert('Payment successful!');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
    setProcessing(false);
  };

  return (
    <div className="payment-form">
      <h3>Payment Details</h3>
      
      <div className="payment-amount">
        <h4>Total Amount: KSh {amount}</h4>
      </div>

      <div className="payment-methods">
        <h4>Select Payment Method</h4>
        
        <div className="method-options">
          <label className="method-option">
            <input
              type="radio"
              value="mpesa"
              checked={paymentMethod === 'mpesa'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="method-info">
              <span className="method-name">M-Pesa</span>
              <span className="method-desc">Mobile Money</span>
            </div>
          </label>

          <label className="method-option">
            <input
              type="radio"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="method-info">
              <span className="method-name">Credit/Debit Card</span>
              <span className="method-desc">Visa/Mastercard</span>
            </div>
          </label>
        </div>
      </div>

      {paymentMethod === 'mpesa' && (
        <div className="mpesa-details">
          <p>You will receive an M-Pesa prompt on your phone</p>
        </div>
      )}

      {paymentMethod === 'card' && (
        <div className="card-details">
          <div className="form-group">
            <label>Card Number</label>
            <input type="text" placeholder="1234 5678 9012 3456" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" placeholder="MM/YY" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input type="text" placeholder="123" />
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={handlePayment} 
        disabled={processing}
        className="btn-primary payment-btn"
      >
        {processing ? 'Processing...' : `Pay KSh ${amount}`}
      </button>
    </div>
  );
};

export default PaymentForm;