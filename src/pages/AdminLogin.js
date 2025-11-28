import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting admin login...');
      
      const data = await adminService.login(formData);

      console.log('📡 Full response:', data);

      if (data.success) {
        console.log('🎉 LOGIN SUCCESSFUL!');
        
        // Store everything
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.admin) {
          localStorage.setItem('madeasy_user', JSON.stringify(data.admin));
        }
        
        console.log('💾 Stored in localStorage:');
        console.log('   Token:', localStorage.getItem('token') ? '✅' : '❌');
        console.log('   User:', localStorage.getItem('madeasy_user') ? '✅' : '❌');
        
        // Redirect to dashboard
        navigate('/admin/dashboard');
      } else {
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('💥 NETWORK ERROR:', error);
      setError(error.message || 'Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Quick test function
  const quickTest = () => {
    console.log('🧪 QUICK TEST - Manual admin setup');
    
    const adminUser = {
      _id: 'admin_test_001',
      name: 'Test Admin',
      email: 'admin@madeasy.com',
      role: 'super_admin'
    };

    localStorage.setItem('madeasy_user', JSON.stringify(adminUser));
    localStorage.setItem('token', 'test-token-123');
    
    console.log('💾 Manual setup complete');
    console.log('   User:', localStorage.getItem('madeasy_user'));
    console.log('   Token:', localStorage.getItem('token'));
    
    // Test dashboard route
    fetch('/admin/dashboard')
      .then(response => {
        console.log('📊 Dashboard route status:', response.status);
        if (response.status === 200) {
          console.log('✅ Dashboard route exists! Redirecting...');
          window.location.href = '/admin/dashboard';
        } else {
          console.log('❌ Dashboard route returned status:', response.status);
          console.log('🚀 Attempting redirect anyway...');
          window.location.href = '/admin/dashboard';
        }
      })
      .catch(error => {
        console.error('Error checking dashboard:', error);
      });
  };

  // Direct dashboard access
  const goToDashboard = () => {
    console.log('🚀 Direct dashboard access');
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>⚙️ Admin Portal</h1>
          <p>Manage your cleaning platform</p>
        </div>

        {error && (
          <div className="error-alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@madeasy.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="admin123"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? '🔄 Signing In...' : '🚀 Sign In to Admin Portal'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4>🧪 Debug Tools:</h4>
          <button 
            onClick={quickTest}
            style={{
              padding: '10px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px',
              marginRight: '10px'
            }}
          >
            Manual Admin Setup
          </button>
          <button 
            onClick={goToDashboard}
            style={{
              padding: '10px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Go to Dashboard
          </button>
          <p><small>Use these if login redirect doesn't work</small></p>
        </div>

        <div className="test-credentials">
          <h3>Test Credentials:</h3>
          <p>📧 Email: <strong>admin@madeasy.com</strong></p>
          <p>🔑 Password: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;