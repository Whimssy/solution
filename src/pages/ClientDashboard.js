import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import './Dashboard.css';

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
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
      
      let allBookings = [];
      
      try {
        // Try to fetch from API first
        const apiResponse = await bookingService.getUserBookings();
        if (apiResponse && apiResponse.data) {
          allBookings = Array.isArray(apiResponse.data) ? apiResponse.data : [];
        }
      } catch (apiError) {
        console.warn('API fetch failed, trying localStorage:', apiError);
        
        // Fallback to localStorage
        try {
          const storedBookings = localStorage.getItem('madeasy_bookings');
          if (storedBookings) {
            const parsedBookings = JSON.parse(storedBookings);
            allBookings = parsedBookings
              .filter(booking => booking.userId === safeUser.id || booking.user?._id === safeUser.id);
          }
        } catch (storageError) {
          console.warn('Error reading localStorage:', storageError);
        }
      }
      
      // Separate bookings into recent and upcoming
      const now = new Date();
      const recent = allBookings
        .filter(booking => {
          const bookingDate = new Date(booking.schedule?.date || booking.date);
          return bookingDate < now || booking.status === 'completed' || booking.status === 'cancelled';
        })
        .slice(0, 3)
        .reverse();
      
      const upcoming = allBookings
        .filter(booking => {
          const bookingDate = new Date(booking.schedule?.date || booking.date);
          const status = booking.status || booking.schedule?.status;
          return bookingDate >= now && 
                 ['pending', 'confirmed', 'in_progress', 'payment_pending'].includes(status);
        })
        .sort((a, b) => {
          const dateA = new Date(a.schedule?.date || a.date);
          const dateB = new Date(b.schedule?.date || b.date);
          return dateA - dateB;
        });
      
      setRecentBookings(recent);
      setUpcomingBookings(upcoming);

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

  const handleFindCleaners = () => {
    navigate('/');
  };

  const handleMyBookings = () => {
    // Scroll to upcoming bookings section or show all bookings
    const bookingsSection = document.querySelector('.recent-bookings-section');
    if (bookingsSection) {
      bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not authenticated, prompt sign up
      checkAuthAndAction('view bookings');
    }
  };

  const handleBookingHistory = () => {
    // Scroll to recent bookings section
    const historySection = document.querySelector('.recent-bookings-section');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not authenticated, prompt sign up
      checkAuthAndAction('view booking history');
    }
  };

  const handleReferAndEarn = () => {
    if (currentUser) {
      navigate('/referrals');
    } else {
      checkAuthAndAction('refer friends');
    }
  };

  const quickActions = [
    {
      icon: '🔍',
      title: 'Find Cleaners',
      description: 'Browse and book professional cleaning services',
      action: handleFindCleaners,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
    },
    {
      icon: '📅',
      title: 'My Bookings',
      description: 'View and manage all your cleaning appointments',
      action: handleMyBookings,
      color: '#2196F3',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
    },
    {
      icon: '📋',
      title: 'Booking History',
      description: 'See your past cleaning service history',
      action: handleBookingHistory,
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
    },
    {
      icon: '📤',
      title: 'Refer & Earn',
      description: 'Share with friends and earn rewards',
      action: handleReferAndEarn,
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'confirmed': return '#17a2b8';
      case 'pending_payment': return '#ffc107';
      case 'payment_pending': return '#ffc107';
      case 'in_progress': return '#007bff';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'pending_payment': return 'Payment Pending';
      case 'payment_pending': return 'Payment Pending';
      case 'in_progress': return 'In Progress';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  const formatBookingDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatBookingTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  const checkAuthAndAction = (actionName = 'this action') => {
    if (!currentUser) {
      const shouldProceed = window.confirm(`You need to sign up to ${actionName}. Would you like to sign up now?`);
      if (shouldProceed) {
        navigate('/register');
      }
      return false;
    }
    return true;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!checkAuthAndAction('cancel this booking')) return;
    
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      await bookingService.cancelBooking(bookingId);
      loadUserData();
    } catch (error) {
      alert('Failed to cancel booking: ' + error.message);
    }
  };

  const handleBookAgain = (booking) => {
    if (!checkAuthAndAction('book again')) return;
    
    if (booking.cleaner?.user?._id || booking.cleanerId) {
      const cleanerId = booking.cleaner?.user?._id || booking.cleanerId;
      navigate(`/cleaner/${cleanerId}`);
    } else {
      navigate('/');
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

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !error.includes('load')) {
    return (
      <div className="dashboard-wrapper">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1 className="welcome-title">
                <span className="greeting-text">It's Cleaning O'Clock Somewhere!</span>
                {currentUser && (
                  <span className="user-name">Hello, {safeUser.name}! 👋</span>
                )}
              </h1>
              <p className="welcome-tagline">Your trusted partner for spotless spaces, one click away</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (!currentUser) {
                    const shouldProceed = window.confirm('You need to sign up to book a cleaning. Would you like to sign up now?');
                    if (shouldProceed) navigate('/register');
                  } else {
                    navigate('/');
                  }
                }}
              >
                Book New Cleaning
              </button>
            </div>
          </div>

          {/* Not Authenticated Notice */}
          {!currentUser && (
            <div className="auth-notice">
              <div className="notice-content">
                <span className="notice-icon">ℹ️</span>
                <div>
                  <strong>Sign up to get started!</strong>
                  <p>Create an account to book cleaners, manage your appointments, and access all features.</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/register')}
                >
                  Sign Up Now
                </button>
              </div>
            </div>
          )}

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

          {/* Upcoming Bookings Section */}
          {upcomingBookings.length > 0 && (
            <div className="recent-bookings-section">
              <div className="section-header">
                <div>
                  <h2>Upcoming Bookings</h2>
                  <p>Your scheduled cleaning appointments</p>
                </div>
              </div>
              <div className="bookings-grid">
                {upcomingBookings.map(booking => {
                  const bookingId = booking._id || booking.id;
                  const status = booking.status || booking.schedule?.status;
                  const cleanerName = booking.cleaner?.user?.name || booking.cleanerName || 'Not assigned';
                  const bookingDate = booking.schedule?.date || booking.date;
                  const bookingTime = booking.schedule?.startTime || booking.time;
                  const duration = booking.schedule?.duration || booking.duration || 0;
                  const address = booking.address?.street 
                    ? `${booking.address.street}, ${booking.address.city}` 
                    : booking.address || 'Address not specified';
                  const total = booking.pricing?.totalAmount || booking.total || 0;
                  const paymentStatus = booking.paymentStatus || 'pending';
                  
                  return (
                    <div key={bookingId} className="booking-card">
                      <div className="booking-header">
                        <h4>{booking.serviceType || 'Cleaning Service'}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-item">
                          <span className="detail-label">Cleaner:</span>
                          <span className="detail-value">{cleanerName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Date & Time:</span>
                          <span className="detail-value">
                            {formatBookingDate(bookingDate)} at {formatBookingTime(bookingTime)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">{duration} hours</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">{address}</span>
                        </div>
                        {paymentStatus === 'pending' && (
                          <div className="detail-item">
                            <span className="detail-label">Payment:</span>
                            <span className="detail-value" style={{ color: '#ffc107' }}>
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="booking-footer">
                        <div className="booking-amount">
                          KSh {total.toLocaleString()}
                        </div>
                        <div className="booking-actions">
                          {paymentStatus === 'pending' && status !== 'cancelled' && (
                            <button 
                              className="btn btn-warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (checkAuthAndAction('complete payment')) {
                                  navigate(`/payment/${bookingId}`);
                                }
                              }}
                            >
                              Complete Payment
                            </button>
                          )}
                          <button 
                            className="btn btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/booking/${bookingId}`);
                            }}
                          >
                            View Details
                          </button>
                          {status !== 'completed' && status !== 'cancelled' && status !== 'in_progress' && (
                            <button 
                              className="btn btn-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(bookingId);
                              }}
                              style={{ borderColor: '#dc3545', color: '#dc3545' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                {recentBookings.map(booking => {
                  const bookingId = booking._id || booking.id;
                  const status = booking.status || 'completed';
                  const cleanerName = booking.cleaner?.user?.name || booking.cleanerName || 'Not assigned';
                  const bookingDate = booking.schedule?.date || booking.date;
                  const bookingTime = booking.schedule?.startTime || booking.time;
                  const duration = booking.schedule?.duration || booking.duration || 0;
                  const address = booking.address?.street 
                    ? `${booking.address.street}, ${booking.address.city}` 
                    : booking.address || 'Address not specified';
                  const total = booking.pricing?.totalAmount || booking.total || 0;
                  
                  return (
                    <div key={bookingId} className="booking-card">
                      <div className="booking-header">
                        <h4>{booking.serviceType || 'Cleaning Service'}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-item">
                          <span className="detail-label">Cleaner:</span>
                          <span className="detail-value">{cleanerName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Date & Time:</span>
                          <span className="detail-value">
                            {formatBookingDate(bookingDate)} at {formatBookingTime(bookingTime)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">{duration} hours</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">{address}</span>
                        </div>
                      </div>
                      
                      <div className="booking-footer">
                        <div className="booking-amount">
                          KSh {total.toLocaleString()}
                        </div>
                        <div className="booking-actions">
                          <button 
                            className="btn btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/booking/${bookingId}`);
                            }}
                          >
                            View Details
                          </button>
                          {status === 'completed' && (
                            <button 
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookAgain(booking);
                              }}
                            >
                              Book Again
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Bookings Yet</h3>
                <p>You haven't made any bookings yet. Start by finding a cleaner!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

