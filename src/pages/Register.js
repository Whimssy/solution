import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (message) setMessage('');
  };

  const formatPhoneNumber = (value) => {
    // Auto-format to Kenyan format
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length <= 10) {
      return digits;
    } else if (digits.startsWith('254') && digits.length <= 12) {
      return '+' + digits;
    } else if (digits.startsWith('7') && digits.length <= 9) {
      return '+254' + digits;
    } else if (digits.startsWith('+254') && digits.length <= 13) {
      return value;
    }
    return value.slice(0, 13);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate phone (Kenyan format)
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const phoneToCheck = phoneDigits.startsWith('0') ? phoneDigits : '+254' + phoneDigits.slice(3);
    if (!phoneRegex.test(phoneToCheck)) {
      setError('Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      return false;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Format phone number for backend
      let phoneNumber = formData.phone;
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+254' + phoneNumber.slice(1);
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+254' + phoneNumber;
      }

      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        phone: phoneNumber,
        password: formData.password,
        username: formData.username || formData.name.toLowerCase().replace(/\s+/g, '_') // Auto-generate if not provided
      };

      // Call registration API
      const response = await authService.register(registrationData);

      if (response.success) {
        setMessage('Registration successful! Redirecting to home page...');
        
        // Store user in localStorage
        localStorage.setItem('madeasy_user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Redirect to home page after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-brand">
          <div className="logo">✨</div>
          <h1>MADEASY</h1>
          <p>Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-header">
            <h2>Sign Up</h2>
            <p>Join MADEASY to book cleaning services or become a cleaner</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username (Optional)</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username (auto-generated if empty)"
              disabled={loading}
            />
            <small>If left empty, username will be auto-generated from your name</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="0712345678 or +254712345678"
              required
              disabled={loading}
              maxLength="13"
            />
            <small>Kenyan phone number format required</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 6 characters"
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                required
                disabled={loading}
              />
              <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="form-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

