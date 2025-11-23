// src/components/layout/Navbar.js
import React from 'react';
import {useAuth}from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2 onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            🧹 Madeasy
          </h2>
        </div>
        
        <div className="nav-links">
          {user ? (
            <>
              <div className="nav-menu">
                <button 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => handleNavigation('/dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                  onClick={() => handleNavigation('/search')}
                >
                  Find Cleaners
                </button>
                <button 
                  className={`nav-link ${isActive('/referral') ? 'active' : ''}`}
                  onClick={() => handleNavigation('/referral')}
                >
                  Refer & Earn
                </button>
                {user.type === 'admin' && (
                  <button 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/admin')}
                  >
                    Admin
                  </button>
                )}
              </div>
              
              <div className="user-section">
                <span className="welcome-text">Welcome, {user.name || user.phoneNumber}</span>
                <button onClick={handleLogout} className="btn-secondary logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="guest-section">
              <span>Welcome to Madeasy</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;