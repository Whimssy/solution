import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { APIError } from '../config/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          // Redirect to returnUrl if provided, otherwise go to home
          const returnUrl = searchParams.get('returnUrl');
          navigate(returnUrl ? decodeURIComponent(returnUrl) : '/', { replace: true });
        }, 1500);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error types with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof APIError) {
        switch (err.errorType) {
          case 'DATABASE_ERROR':
            errorMessage = 'Database connection issue. Please ensure MongoDB is running and try again.';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Cannot connect to server. Please check if the backend server is running.';
            break;
          case 'AUTH_ERROR':
            errorMessage = err.message || 'Invalid email or password. Please check your credentials.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = err.message || 'Please check your input and try again.';
            break;
          case 'SERVER_ERROR':
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = err.message || 'Login failed. Please try again.';
        }
      } else {
        errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="logo">🧹</div>
          <h1>MADEASY</h1>
          <p>Welcome Back</p>
        </div>
        
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <strong>⚠️ Error:</strong> {error}
                {error.includes('Database') && (
                  <div style={{ marginTop: '8px', fontSize: '0.9em', opacity: 0.9 }}>
                    💡 Tip: Make sure MongoDB is running. Check the backend terminal for connection status.
                  </div>
                )}
                {error.includes('Cannot connect to server') && (
                  <div style={{ marginTop: '8px', fontSize: '0.9em', opacity: 0.9 }}>
                    💡 Tip: Ensure the backend server is running on port 5000.
                  </div>
                )}
              </div>
            )}

            {message && (
              <div className="alert alert-success">
                {message}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-options">
              <label className="remember-me" htmlFor="remember">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="form-footer">
              <p>
                Don't have an account? <Link to="/register">Sign Up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
