import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'verify'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { otpLogin, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setMessage('Please enter your phone number');
      setMessageType('error');
      return;
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setMessage('Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      setMessageType('error');
      return;
    }

    const result = await otpLogin(phoneNumber);
    if (result.success) {
      setStep('verify');
      setMessage(`OTP sent to ${formatPhoneDisplay(phoneNumber)}`);
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
    if (result.success) {
      setMessage('Login successful! Redirecting...');
      setMessageType('success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setMessage('Invalid OTP. Please try again.');
      setMessageType('error');
    }
  };

  const formatPhoneNumber = (value) => {
    // Auto-format to Kenyan format
    if (value.startsWith('0') && value.length === 10) {
      return '+254' + value.slice(1);
    }
    return value;
  };

  const formatPhoneDisplay = (phone) => {
    // Format for display: +254 XXX XXX XXX
    if (phone.startsWith('+254') && phone.length === 13) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 10)} ${phone.slice(10)}`;
    }
    return phone;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) {
      setPhoneNumber(value.slice(0, 10));
    } else if (value.startsWith('254')) {
      setPhoneNumber('+' + value.slice(0, 12));
    } else if (value.startsWith('7')) {
      setPhoneNumber('+254' + value.slice(0, 9));
    } else {
      setPhoneNumber(value.slice(0, 13));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setOtp(value.slice(0, 4));
  };

  const handleDemoLogin = () => {
    setPhoneNumber('+254712345678');
    setOtp('1234');
    setMessage('Demo credentials loaded. Click "Send OTP" then "Verify OTP"');
    setMessageType('info');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="logo">🧹</div>
          <h1>Madeasy</h1>
          <p>Professional Cleaning Services</p>
        </div>
        
        <div className="otp-login">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Enter your phone number to continue</p>
          </div>
          
          {step === 'phone' && (
            <div className="phone-step">
              <div className="input-group">
                <label htmlFor="phone-input">Phone Number *</label>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="0712345678 or +254712345678"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="phone-input"
                  maxLength="13"
                />
                <div className="input-hint">
                  Enter your Kenyan phone number
                </div>
              </div>

              <button 
                onClick={handleSendOtp}
                disabled={loading || phoneNumber.length < 10}
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

              <div className="demo-quick-action">
                <button 
                  onClick={handleDemoLogin}
                  className="demo-btn"
                  type="button"
                >
                  Use Demo Credentials
                </button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="verify-step">
              <div className="otp-header">
                <h3>Verify Your Number</h3>
                <p>Enter the 4-digit code sent to <strong>{formatPhoneDisplay(phoneNumber)}</strong></p>
              </div>
              
              <div className="input-group">
                <label htmlFor="otp-input">OTP Code *</label>
                <input
                  id="otp-input"
                  type="text"
                  placeholder="1234"
                  value={otp}
                  onChange={handleOtpChange}
                  className="otp-input"
                  maxLength="4"
                  inputMode="numeric"
                />
                <div className="input-hint">
                  Enter the 4-digit code from SMS
                </div>
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
                  type="button"
                >
                  ← Change Number
                </button>
              </div>

              <div className="resend-otp">
                <p>Didn't receive the code?</p>
                <button 
                  onClick={handleSendOtp}
                  className="resend-btn"
                  disabled={loading}
                  type="button"
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
            <p>By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></p>
          </div>
        </div>
        
        <div className="demo-notice">
          <h4>📱 Demo Instructions:</h4>
          <div className="demo-steps">
            <div className="demo-step">
              <span className="step-number">1</span>
              <span>Use any Kenyan number format: <strong>0712345678</strong> or <strong>+254712345678</strong></span>
            </div>
            <div className="demo-step">
              <span className="step-number">2</span>
              <span>Click "Send OTP" (simulated)</span>
            </div>
            <div className="demo-step">
              <span className="step-number">3</span>
              <span>Enter OTP: <strong>1234</strong></span>
            </div>
            <div className="demo-step">
              <span className="step-number">4</span>
              <span>Click "Verify OTP" to login</span>
            </div>
          </div>
          <button 
            onClick={handleDemoLogin}
            className="btn-demo-quick"
          >
            🚀 Quick Demo Setup
          </button>
        </div>

        <div className="additional-options">
          <div className="divider">
            <span>Or</span>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/become-cleaner')}>
            🧼 Become a Cleaner
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;