// components/auth/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const { sendOtp, verifyOtp } = useAuth();

  const handleSendOtp = async () => {
    try {
      await sendOtp(phoneNumber);
      setShowOtp(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(phoneNumber, otp);
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome to Madeasy</h2>
        
        {!showOtp ? (
          <div className="phone-input-section">
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-field"
            />
            <button onClick={handleSendOtp} className="btn-primary">
              Send OTP
            </button>
          </div>
        ) : (
          <div className="otp-section">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field"
              maxLength={6}
            />
            <button onClick={handleVerifyOtp} className="btn-primary">
              Verify OTP
            </button>
            <button 
              onClick={() => setShowOtp(false)} 
              className="btn-secondary"
            >
              Change Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;