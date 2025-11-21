// src/components/auth/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      setShowOtp(true);
      alert('OTP sent successfully! Use 123456 for demo.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phoneNumber, otp);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert(error.message || 'Invalid OTP. Please try 123456 for demo.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome to Madeasy</h2>
        <p style={{textAlign: 'center', color: '#7f8c8d', marginBottom: '20px'}}>
          Book cleaning services easily
        </p>
        
        {!showOtp ? (
          <div className="phone-input-section">
            <input
              type="tel"
              placeholder="Enter phone number (e.g., +254712345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-field"
            />
            <button 
              onClick={handleSendOtp} 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="otp-section">
            <p>OTP sent to {phoneNumber}</p>
            <input
              type="text"
              placeholder="Enter OTP (use 123456 for demo)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field"
              maxLength={6}
            />
            <button 
              onClick={handleVerifyOtp} 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              onClick={() => {
                setShowOtp(false);
                setOtp('');
              }} 
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

export default LoginForm;