import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  // Social media handlers (since we don't have actual URLs yet)
  const handleSocialClick = (platform) => {
    console.log(`Redirect to ${platform}`);
    // You can add actual redirects later
    // window.open(`https://${platform}.com/madeasy`, '_blank');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🧹 Madeasy</h3>
          <p>Your trusted platform for booking cleaning services and referring great cleaners.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/search">Find Cleaners</a></li>
            <li><a href="/referrals">Refer & Earn</a></li>
            <li><a href="/dashboard">My Dashboard</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact Info</h4>
          <ul>
            <li>📞 +254 700 123 456</li>
            <li>✉️ support@madeasy.com</li>
            <li>📍 Nairobi, Kenya</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            {/* ✅ FIXED: Using buttons instead of empty hrefs */}
            <button 
              className="social-btn"
              onClick={() => handleSocialClick('facebook')}
              aria-label="Facebook"
            >
              📘
            </button>
            <button 
              className="social-btn"
              onClick={() => handleSocialClick('twitter')}
              aria-label="Twitter"
            >
              🐦
            </button>
            <button 
              className="social-btn"
              onClick={() => handleSocialClick('instagram')}
              aria-label="Instagram"
            >
              📷
            </button>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Madeasy Booking System. All rights reserved.</p>
        
        {/* Admin Dashboard Link */}
        <div className="footer-admin-link">
          {user?.role === 'admin' || user?.role === 'super_admin' ? (
            <button 
              className="admin-dashboard-btn"
              onClick={handleAdminClick}
              title="Admin Dashboard"
            >
              ⚙️ Admin Dashboard
            </button>
          ) : (
            <button 
              className="admin-login-btn"
              onClick={handleAdminClick}
              title="Admin Login"
            >
              🔐 Admin
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;