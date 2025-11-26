import { useState } from 'react';
import PaymentService from '../../services/paymentService';
import './PaymentForm.css';

const PaymentForm = ({ bookingId, amount, customerDetails }) => {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    email: customerDetails?.email || '',
    name: customerDetails?.name || ''
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await PaymentService.processPayment({
        bookingId,
        amount,
        method: paymentMethod,
        ...paymentData
      });

      // Handle different response formats based on payment method
      if (paymentMethod === 'flutterwave') {
        // Flutterwave handles UI, we get callback
      } else if (paymentMethod === 'pesapal') {
        // Redirect to Pesapal
        window.location.href = result.redirect_url;
      } else {
        // M-Pesa - show confirmation
        console.log('M-Pesa payment initiated:', result);
      }
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <h3>Complete Payment</h3>
      <div className="payment-amount">
        <strong>Amount: KES {amount}</strong>
      </div>

      {/* Payment Method Selection */}
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="mpesa"
            checked={paymentMethod === 'mpesa'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          M-Pesa
        </label>
        
        <label>
          <input
            type="radio"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit/Debit Card
        </label>
      </div>

      {/* Dynamic Fields Based on Payment Method */}
      {paymentMethod === 'mpesa' && (
        <div className="payment-field">
          <label>Phone Number:</label>
          <input
            type="tel"
            placeholder="07XXXXXXXX"
            value={paymentData.phoneNumber}
            onChange={(e) => setPaymentData({...paymentData, phoneNumber: e.target.value})}
          />
        </div>
      )}

      {paymentMethod === 'card' && (
        <div className="gateway-selection">
          <label>Payment Gateway:</label>
          <select onChange={(e) => setPaymentData({...paymentData, gateway: e.target.value})}>
            <option value="pesapal">Pesapal</option>
            <option value="flutterwave">Flutterwave</option>
          </select>
        </div>
      )}

      <button 
        onClick={handlePayment} 
        disabled={isProcessing}
        className="pay-button"
      >
        {isProcessing ? 'Processing...' : `Pay KES ${amount}`}
      </button>
    </div>
  );
};

export default PaymentForm;