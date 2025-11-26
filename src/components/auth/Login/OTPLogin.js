import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './OTPLogin.css';

const OTPLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { otpLogin, verifyOtp, loading } = useAuth();

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setMessage('Please enter your phone number');
      setMessageType('error');
      return;
    }

    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setMessage('Please enter a valid Kenyan phone number (e.g., +254712345678)');
      setMessageType('error');
      return;
    }

    const result = await otpLogin(phoneNumber);
    if (result.success) {
      setStep('verify');
      setMessage(`OTP sent to ${phoneNumber}`);
      setMessageType('success');
    } else {
      setMessage('Failed to send OTP. Please try again.');
      setMessageType('error');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      setMessage('Please enter a valid 4-digit OTP');
      setMessageType('error');
      return;
    }

    const result = await verifyOtp(phoneNumber, otp);
    if (!result.success) {
      setMessage('Invalid OTP. Please try again.');
      setMessageType('error');
    }
  };

  const formatPhoneNumber = (value) => {
    if (value.startsWith('0') && value.length === 10) {
      return '+254' + value.slice(1);
    }
    return value;
  };

  return (
    <div className="otp-login">
      <div className="login-header">
        <h2>Welcome to Madeasy</h2>
        <p>Enter your phone number to continue</p>
      </div>
      
      {step === 'phone' && (
        <div className="phone-step">
          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              className="phone-input"
              maxLength="13"
            />
          </div>
          <button 
            onClick={handleSendOtp}
            disabled={loading || !phoneNumber}
            className={`send-otp-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="verify-step">
          <div className="otp-header">
            <h3>Verify Your Number</h3>
            <p>Enter the 4-digit code sent to {phoneNumber}</p>
          </div>
          
          <div className="input-group">
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="1234"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value.slice(0, 4));
              }}
              className="otp-input"
              maxLength="4"
            />
          </div>

          <div className="otp-actions">
            <button 
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 4}
              className={`verify-otp-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
            
            <button 
              onClick={() => {
                setStep('phone');
                setMessage('');
                setOtp('');
              }}
              className="back-btn"
              disabled={loading}
            >
              Change Number
            </button>
          </div>

          <div className="resend-otp">
            <p>Didn't receive the code?</p>
            <button 
              onClick={handleSendOtp}
              className="resend-btn"
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="login-footer">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
};

export default OTPLogin;