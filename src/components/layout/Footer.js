// src/components/layout/Footer.js
import React from 'react';

const Footer = () => {
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
            <li><a href="/referral">Refer & Earn</a></li>
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
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Instagram">📷</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Madeasy Booking System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;