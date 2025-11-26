// services/paymentService.js
class PaymentService {
  constructor() {
    this.gateways = {
      mpesa: this.processMpesaPayment.bind(this),
      card: this.processCardPayment.bind(this),
      pesapal: this.processPesapalPayment.bind(this),
      flutterwave: this.processFlutterwavePayment.bind(this),
      bank: this.processBankTransfer.bind(this)
    };

    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Validate payment data
  validatePaymentData(paymentData) {
    const requiredFields = {
      mpesa: ['amount', 'phoneNumber', 'bookingId'],
      card: ['amount', 'bookingId', 'customerEmail'],
      pesapal: ['amount', 'bookingId', 'customerEmail'],
      flutterwave: ['amount', 'bookingId', 'customerEmail', 'customerPhone', 'customerName'],
      bank: ['amount', 'bookingId', 'customerName']
    };

    const method = paymentData.method;
    const fields = requiredFields[method] || [];

    for (const field of fields) {
      if (!paymentData[field]) {
        throw new Error(`Missing required field for ${method}: ${field}`);
      }
    }

    if (paymentData.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (method === 'mpesa' && !/^(?:254|\+254|0)?(7\d{8})$/.test(paymentData.phoneNumber)) {
      throw new Error('Invalid Kenyan phone number format');
    }
  }

  // Retry mechanism with exponential backoff
  async withRetry(operation, retries = this.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === retries) throw error;
        
        console.warn(`Payment attempt ${attempt} failed, retrying...`, error);
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  // Main payment processor
  processPayment = async (paymentData) => {
    try {
      // Validate payment data
      this.validatePaymentData(paymentData);

      const processor = this.gateways[paymentData.method];
      if (!processor) {
        throw new Error(`Unsupported payment method: ${paymentData.method}`);
      }

      // Log payment attempt
      this.logPaymentAttempt(paymentData);

      // Process with retry logic
      const result = await this.withRetry(() => processor(paymentData));

      // Log successful payment
      this.logPaymentSuccess(paymentData, result);

      return {
        success: true,
        transactionId: result.transactionId || result.CheckoutRequestID || result.order_tracking_id,
        message: this.getSuccessMessage(paymentData.method),
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Log failed payment
      this.logPaymentFailure(paymentData, error);

      throw {
        success: false,
        error: error.message,
        code: this.getErrorCode(error),
        timestamp: new Date().toISOString(),
        retryable: this.isRetryableError(error)
      };
    }
  };

  // M-Pesa Integration with enhanced error handling
  processMpesaPayment = async (paymentData) => {
    const payload = {
      BusinessShortCode: process.env.REACT_APP_MPESA_SHORTCODE,
      Password: this.generateMpesaPassword(),
      Timestamp: this.getCurrentTimestamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(paymentData.amount),
      PartyA: this.formatPhoneNumber(paymentData.phoneNumber),
      PartyB: process.env.REACT_APP_MPESA_SHORTCODE,
      PhoneNumber: this.formatPhoneNumber(paymentData.phoneNumber),
      CallBackURL: `${process.env.REACT_APP_API_URL}/payments/mpesa-callback`,
      AccountReference: paymentData.bookingId.substring(0, 12),
      TransactionDesc: `Booking ${paymentData.bookingId}`
    };

    const response = await fetch(`${process.env.REACT_APP_MPESA_URL}/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getMpesaToken()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessage || `M-Pesa payment failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.ResponseCode !== '0') {
      throw new Error(this.getMpesaErrorDescription(data.ResponseCode));
    }

    return data;
  };

  // Card Payment with gateway selection
  processCardPayment = async (paymentData) => {
    const gateway = paymentData.gateway || 'pesapal';
    
    if (gateway === 'pesapal') {
      return await this.processPesapalPayment(paymentData);
    } else {
      return await this.processFlutterwavePayment(paymentData);
    }
  };

  // Pesapal Integration with OAuth
  processPesapalPayment = async (paymentData) => {
    // Get authentication token
    const token = await this.getPesapalToken();

    const payload = {
      id: paymentData.bookingId,
      currency: 'KES',
      amount: paymentData.amount,
      description: `Payment for booking ${paymentData.bookingId}`,
      callback_url: `${process.env.REACT_APP_BASE_URL}/payment-callback?method=pesapal`,
      cancellation_url: `${process.env.REACT_APP_BASE_URL}/payment-cancelled`,
      notification_id: process.env.REACT_APP_PESAPAL_IPN_ID,
      billing_address: {
        email_address: paymentData.customerEmail,
        phone_number: paymentData.customerPhone,
        first_name: paymentData.customerName?.split(' ')[0] || '',
        last_name: paymentData.customerName?.split(' ').slice(1).join(' ') || ''
      }
    };

    const response = await fetch(`${process.env.REACT_APP_PESAPAL_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Pesapal payment failed: ${response.status}`);
    }

    return await response.json();
  };

  // Flutterwave Integration
  processFlutterwavePayment = async (paymentData) => {
    return new Promise((resolve, reject) => {
      if (typeof window.FlutterwaveCheckout === 'undefined') {
        reject(new Error('Flutterwave SDK not loaded'));
        return;
      }

      window.FlutterwaveCheckout({
        public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: paymentData.bookingId,
        amount: paymentData.amount,
        currency: 'KES',
        payment_options: 'card,mpesa,banktransfer',
        redirect_url: `${process.env.REACT_APP_BASE_URL}/payment-callback?method=flutterwave`,
        customer: {
          email: paymentData.customerEmail,
          phone_number: paymentData.customerPhone,
          name: paymentData.customerName
        },
        customizations: {
          title: 'Cleanify Booking Payment',
          description: `Payment for booking ${paymentData.bookingId}`,
          logo: `${process.env.REACT_APP_BASE_URL}/logo.png`
        },
        callback: (response) => {
          if (response.status === 'successful') {
            resolve(response);
          } else {
            reject(new Error(`Flutterwave payment failed: ${response.status}`));
          }
        },
        onclose: () => {
          reject(new Error('Payment cancelled by user'));
        }
      });
    });
  };

  // Bank Transfer Payment
  processBankTransfer = async (paymentData) => {
    // Generate bank transfer details
    return {
      bankName: 'Equity Bank Kenya',
      accountNumber: '1234567890',
      accountName: 'Cleanify Services Ltd',
      branch: 'Nairobi Central',
      swiftCode: 'EQBLKENA',
      reference: paymentData.bookingId,
      amount: paymentData.amount,
      currency: 'KES',
      instructions: `Use booking ID ${paymentData.bookingId} as reference`
    };
  };

  // Verify payment status
  verifyPayment = async (transactionId, method) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId, method })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        verified: result.status === 'completed',
        status: result.status,
        transactionId: result.transactionId,
        amount: result.amount,
        timestamp: result.timestamp,
        metadata: result.metadata
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };

  // Get supported payment methods
  getSupportedMethods = () => {
    return [
      {
        method: 'mpesa',
        name: 'M-Pesa',
        description: 'Pay with M-Pesa mobile money',
        currencies: ['KES'],
        countries: ['KE'],
        minAmount: 10,
        maxAmount: 150000
      },
      {
        method: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, or American Express',
        currencies: ['KES', 'USD'],
        countries: ['KE', 'UG', 'TZ'],
        minAmount: 100,
        maxAmount: 500000
      },
      {
        method: 'pesapal',
        name: 'Pesapal',
        description: 'Secure online payments',
        currencies: ['KES', 'USD'],
        countries: ['KE', 'UG', 'TZ', 'RW'],
        minAmount: 10,
        maxAmount: 1000000
      },
      {
        method: 'flutterwave',
        name: 'Flutterwave',
        description: 'Multiple payment options',
        currencies: ['KES', 'USD', 'GBP', 'EUR'],
        countries: ['KE', 'NG', 'GH', 'ZA'],
        minAmount: 100,
        maxAmount: 500000
      },
      {
        method: 'bank',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        currencies: ['KES'],
        countries: ['KE'],
        minAmount: 100,
        maxAmount: 1000000
      }
    ];
  };

  // Utility methods
  generateMpesaPassword() {
    const shortcode = process.env.REACT_APP_MPESA_SHORTCODE;
    const passkey = process.env.REACT_APP_MPESA_PASSKEY;
    const timestamp = this.getCurrentTimestamp();
    return Buffer.from(shortcode + passkey + timestamp).toString('base64');
  }

  getCurrentTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  formatPhoneNumber(phone) {
    // Convert to 254 format
    return phone.replace(/^0/, '254').replace(/^\+/, '');
  }

  async getMpesaToken() {
    // Implement M-Pesa OAuth token retrieval
    const response = await fetch(`${process.env.REACT_APP_MPESA_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.REACT_APP_MPESA_CONSUMER_KEY}:${process.env.REACT_APP_MPESA_CONSUMER_SECRET}`
        ).toString('base64')}`
      }
    });

    const data = await response.json();
    return data.access_token;
  }

  async getPesapalToken() {
    const response = await fetch(`${process.env.REACT_APP_PESAPAL_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: process.env.REACT_APP_PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.REACT_APP_PESAPAL_CONSUMER_SECRET
      })
    });

    const data = await response.json();
    return data.token;
  }

  getMpesaErrorDescription(code) {
    const errors = {
      '1': 'Insufficient funds',
      '2': 'Less than minimum transaction value',
      '3': 'More than maximum transaction value',
      '4': 'Would exceed account balance',
      '5': 'Would exceed daily transfer limit',
      '6': 'Would exceed minimum balance',
      '7': 'Unresolved primary party',
      '8': 'Unresolved receiver party',
      '9': 'Would exceed maximum balance',
      '10': 'Resource not available',
      '11': 'Sender not allowed to send to this recipient',
      '12': 'Invalid request'
    };
    return errors[code] || `M-Pesa error: ${code}`;
  }

  getSuccessMessage(method) {
    const messages = {
      mpesa: 'Please check your phone to complete the M-Pesa payment',
      card: 'Payment processed successfully',
      pesapal: 'Redirecting to Pesapal for payment',
      flutterwave: 'Redirecting to Flutterwave for payment',
      bank: 'Bank transfer details generated successfully'
    };
    return messages[method] || 'Payment processed successfully';
  }

  getErrorCode(error) {
    if (error.message.includes('timeout')) return 'TIMEOUT';
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    if (error.message.includes('cancelled')) return 'USER_CANCELLED';
    if (error.message.includes('insufficient funds')) return 'INSUFFICIENT_FUNDS';
    return 'PROCESSING_ERROR';
  }

  isRetryableError(error) {
    const nonRetryableCodes = ['INSUFFICIENT_FUNDS', 'USER_CANCELLED'];
    return !nonRetryableCodes.includes(this.getErrorCode(error));
  }

  logPaymentAttempt(paymentData) {
    console.log('Payment attempt:', {
      method: paymentData.method,
      amount: paymentData.amount,
      bookingId: paymentData.bookingId,
      timestamp: new Date().toISOString()
    });
  }

  logPaymentSuccess(paymentData, result) {
    console.log('Payment successful:', {
      method: paymentData.method,
      amount: paymentData.amount,
      bookingId: paymentData.bookingId,
      transactionId: result.transactionId,
      timestamp: new Date().toISOString()
    });
  }

  logPaymentFailure(paymentData, error) {
    console.error('Payment failed:', {
      method: paymentData.method,
      amount: paymentData.amount,
      bookingId: paymentData.bookingId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();
export default paymentService;