// Enhanced payment service with multiple gateway support
class PaymentService {
  constructor() {
    this.gateways = {
      mpesa: this.processMpesaPayment,
      card: this.processCardPayment,
      pesapal: this.processPesapalPayment,
      flutterwave: this.processFlutterwavePayment
    };
  }

  // Main payment processor
  processPayment = async (paymentData) => {
    try {
      const processor = this.gateways[paymentData.method];
      if (!processor) {
        throw new Error(`Unsupported payment method: ${paymentData.method}`);
      }

      return await processor(paymentData);
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  // M-Pesa Integration
  processMpesaPayment = async (paymentData) => {
    const response = await fetch(`${process.env.REACT_APP_MPESA_URL}/stkpush`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_MPESA_TOKEN}`
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.REACT_APP_MPESA_SHORTCODE,
        Amount: paymentData.amount,
        PartyA: paymentData.phoneNumber,
        PartyB: process.env.REACT_APP_MPESA_SHORTCODE,
        PhoneNumber: paymentData.phoneNumber,
        CallBackURL: `${process.env.REACT_APP_BASE_URL}/api/mpesa-callback`,
        AccountReference: paymentData.bookingId,
        TransactionDesc: 'Booking Payment'
      })
    });

    if (!response.ok) throw new Error('M-Pesa payment failed');
    return await response.json();
  };

  // Card Payment (Pesapal/Flutterwave)
  processCardPayment = async (paymentData) => {
    // Implementation for card processing
    const gateway = paymentData.gateway || 'pesapal';
    
    if (gateway === 'pesapal') {
      return await this.processPesapalPayment(paymentData);
    } else {
      return await this.processFlutterwavePayment(paymentData);
    }
  };

  // Pesapal Integration
  processPesapalPayment = async (paymentData) => {
    // Get auth token first
    const authResponse = await fetch(`${process.env.REACT_APP_PESAPAL_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: process.env.REACT_APP_PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.REACT_APP_PESAPAL_CONSUMER_SECRET
      })
    });

    const { token } = await authResponse.json();

    // Submit payment request
    const paymentResponse = await fetch(`${process.env.REACT_APP_PESAPAL_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: paymentData.bookingId,
        currency: 'KES',
        amount: paymentData.amount,
        description: 'Booking Payment',
        callback_url: `${process.env.REACT_APP_BASE_URL}/payment-callback`,
        cancellation_url: `${process.env.REACT_APP_BASE_URL}/payment-cancelled`,
        notification_id: process.env.REACT_APP_PESAPAL_IPN_ID
      })
    });

    return await paymentResponse.json();
  };

  // Flutterwave Integration
  processFlutterwavePayment = async (paymentData) => {
    // Flutterwave Rave implementation
    return await window.FlutterwaveCheckout({
      public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: paymentData.bookingId,
      amount: paymentData.amount,
      currency: 'KES',
      payment_options: 'card,mpesa',
      customer: {
        email: paymentData.customerEmail,
        phone_number: paymentData.customerPhone,
        name: paymentData.customerName
      },
      customizations: {
        title: 'Booking Payment',
        description: 'Payment for booking reservation',
        logo: `${process.env.REACT_APP_BASE_URL}/logo.png`
      },
      callback: (response) => response,
      onclose: () => console.log('Payment closed')
    });
  };

  // Verify payment status
  verifyPayment = async (transactionId, method) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId, method })
    });

    return await response.json();
  };
}

export default new PaymentService();