// src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Route constants for maintainability
  const ROUTES = {
    SEARCH: '/search',
    REFERRAL: '/referral',
    SETTINGS: '/settings'
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  // Handle case where user might not be available
  if (!user) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>User not found</h2>
          <p>Please log in to access your dashboard.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name || 'User'}!</h1>
        <p className="dashboard-subtitle">
          {user.type === 'admin' ? 'Admin Dashboard - Manage the platform' :
           user.type === 'cleaner' ? 'Cleaner Dashboard - Manage your services' :
           'Manage your cleaning services'}
        </p>
      </header>
      
      <div className="dashboard-cards">
        {/* Book a Cleaner Card - Only for clients */}
        {(user.type === 'client' || !user.type) && (
          <div className="card" role="region" aria-label="Book cleaning service">
            <div className="card-icon">🧹</div>
            <h3 className="card-title">Book a Cleaner</h3>
            <p>Find and book professional cleaning services</p>
            <button 
              onClick={() => navigate(ROUTES.SEARCH)} 
              className="btn-primary"
              aria-label="Navigate to cleaner search page"
            >
              Book Now
            </button>
          </div>
        )}

        {/* Cleaner Services Card - Only for cleaners */}
        {user.type === 'cleaner' && (
          <div className="card" role="region" aria-label="Manage cleaning services">
            <div className="card-icon">👨‍💼</div>
            <h3 className="card-title">My Services</h3>
            <p>Manage your cleaning appointments and availability</p>
            <button 
              onClick={() => navigate('/cleaner-dashboard')} 
              className="btn-primary"
            >
              Manage Services
            </button>
          </div>
        )}

        {/* Admin Panel Card - Only for admins */}
        {user.type === 'admin' && (
          <div className="card" role="region" aria-label="Admin panel">
            <div className="card-icon">⚙️</div>
            <h3 className="card-title">Admin Panel</h3>
            <p>Manage users, cleaners, and platform settings</p>
            <button 
              onClick={() => navigate('/admin')} 
              className="btn-primary"
            >
              Admin Dashboard
            </button>
          </div>
        )}

        {/* My Bookings Card - For all users */}
        <div className="card" role="region" aria-label="View your bookings">
          <div className="card-icon">📅</div>
          <h3 className="card-title">My Bookings</h3>
          <p>View your upcoming and past bookings</p>
          <button 
            onClick={() => navigate('/bookings')} 
            className="btn-secondary"
            aria-label="Navigate to bookings page"
          >
            View Bookings
          </button>
        </div>

        {/* Refer & Earn Card */}
        <div className="card" role="region" aria-label="Referral program">
          <div className="card-icon">👥</div>
          <h3 className="card-title">Refer & Earn</h3>
          <p>Refer cleaners to friends and earn rewards</p>
          <button 
            onClick={() => navigate(ROUTES.REFERRAL)} 
            className="btn-primary"
            aria-label="Navigate to referral program page"
          >
            Refer Now
          </button>
        </div>

        {/* Account Settings Card */}
        <div className="card" role="region" aria-label="Account settings">
          <div className="card-icon">🔧</div>
          <h3 className="card-title">Account Settings</h3>
          <p>Manage your profile and preferences</p>
          <button 
            onClick={() => navigate(ROUTES.SETTINGS)} 
            className="btn-secondary"
            aria-label="Navigate to settings page"
          >
            Settings
          </button>
        </div>

        {/* Quick Stats Card */}
        <div className="card stats-card" role="region" aria-label="User statistics">
          <div className="card-icon">📊</div>
          <h3 className="card-title">Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Bookings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Referrals</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Rewards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <p>Welcome to Madeasy! Start by booking your first cleaner.</p>
            <span className="activity-time">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;