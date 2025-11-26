import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safe user data access
  const safeUser = currentUser || { id: 'guest', name: 'Guest' };

  // Memoized data loading function
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let userBookings = [];
      
      try {
        const storedBookings = localStorage.getItem('madeasy_bookings');
        if (storedBookings) {
          const parsedBookings = JSON.parse(storedBookings);
          userBookings = parsedBookings
            .filter(booking => booking.userId === safeUser.id)
            .slice(0, 3)
            .reverse();
        }
      } catch (storageError) {
        console.warn('Error reading localStorage:', storageError);
      }
      
      setRecentBookings(userBookings);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [safeUser.id]);

  useEffect(() => {
    let mounted = true;
    
    const initializeDashboard = async () => {
      if (mounted) {
        await loadUserData();
      }
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [loadUserData]);

  const quickActions = [
    {
      icon: '🔍',
      title: 'Find Cleaners',
      description: 'Book professional cleaning services',
      action: () => navigate('/search'),
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
    },
    {
      icon: '👥',
      title: 'Become a Cleaner',
      description: 'Start earning on our platform',
      action: () => navigate('/become-cleaner'),
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
    },
    {
      icon: '📤',
      title: 'Refer & Earn',
      description: 'Share with friends and earn rewards',
      action: () => navigate('/referrals'),
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'confirmed': return '#17a2b8';
      case 'pending_payment': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'confirmed': return 'Confirmed';
      case 'pending_payment': return 'Payment Pending';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  const handleActionClick = (action) => {
    try {
      action();
    } catch (err) {
      console.error('Error executing action:', err);
      setError('Action failed. Please try again.');
    }
  };

  const handleRetry = () => {
    loadUserData();
  };

  // Error boundary fallback
  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Navbar />
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Navbar />
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      
      <div className="dashboard">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1>Welcome to MADEASY {safeUser.name}! 👋</h1>
              <p>ITS CLEANING O'CLOCK SOMEWHERE</p>
              <p>Request your cleaner by clicks</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/search')}
              >
                Book New Cleaning
              </button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Get things done quickly with these shortcuts</p>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="quick-action-card"
                  onClick={() => handleActionClick(action.action)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleActionClick(action.action);
                    }
                  }}
                >
                  <div 
                    className="action-icon"
                    style={{ background: action.gradient }}
                  >
                    {action.icon}
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings Section */}
          <div className="recent-bookings-section">
            <div className="section-header">
              <div>
                <h2>Recent Bookings</h2>
                <p>Your latest cleaning appointments</p>
              </div>
              {recentBookings.length > 0 && (
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/bookings')}
                >
                  View All Bookings
                </button>
              )}
            </div>

            {recentBookings.length > 0 ? (
              <div className="bookings-grid">
                {recentBookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h4>{booking.serviceType || 'Cleaning Service'}</h4>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-label">Cleaner:</span>
                        <span className="detail-value">{booking.cleanerName || 'Not assigned'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">
                          {booking.date || 'TBD'} at {booking.time || 'TBD'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{booking.duration || 0} hours</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{booking.address || 'Address not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="booking-footer">
                      <div className="booking-amount">
                        KSh {(booking.total || 0).toLocaleString()}
                      </div>
                      <div className="booking-actions">
                        {booking.status === 'pending_payment' && (
                          <button 
                            className="btn btn-warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/payment/${booking.id}`);
                            }}
                          >
                            Complete Payment
                          </button>
                        )}
                        <button 
                          className="btn btn-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/booking/${booking.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Bookings Yet</h3>
                <p>You haven't made any bookings yet. Start by finding a cleaner!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/search')}
                >
                  Find a Cleaner
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;