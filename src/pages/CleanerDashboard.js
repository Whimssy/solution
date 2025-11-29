import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cleanerService } from '../services/cleanerService';
import { bookingService } from '../services/bookingService';
import './CleanerDashboard.css';

const CleanerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    rating: 0,
    completedJobs: 0
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const safeUser = currentUser || { id: 'guest', name: 'Guest' };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cleaner's bookings
      let bookingsData = [];
      try {
        const response = await cleanerService.getCleanerBookings();
        bookingsData = response?.data || (Array.isArray(response) ? response : []);
      } catch (apiError) {
        console.warn('API fetch failed, trying localStorage:', apiError);
        // Fallback to localStorage if needed
        const storedBookings = localStorage.getItem('madeasy_bookings');
        if (storedBookings) {
          const parsed = JSON.parse(storedBookings);
          bookingsData = parsed.filter(b => b.cleanerId === safeUser.id);
        }
      }

      // Calculate stats
      const now = new Date();
      const upcomingBookings = bookingsData.filter(booking => {
        const bookingDate = new Date(booking.schedule?.date || booking.date);
        const status = booking.status || 'pending';
        return bookingDate >= now && 
               ['pending', 'confirmed', 'in_progress'].includes(status);
      });

      const pending = bookingsData.filter(b => b.status === 'pending' || b.status === 'confirmed');
      const completed = bookingsData.filter(b => b.status === 'completed');

      // Calculate earnings
      const completedBookings = bookingsData.filter(b => b.status === 'completed');
      const totalEarnings = completedBookings.reduce((sum, b) => {
        return sum + ((b.pricing?.totalAmount || b.total) || 0);
      }, 0);

      const pendingBookingsForEarnings = bookingsData.filter(b => 
        ['pending', 'confirmed', 'in_progress'].includes(b.status)
      );
      const pendingEarnings = pendingBookingsForEarnings.reduce((sum, b) => {
        return sum + ((b.pricing?.totalAmount || b.total) || 0);
      }, 0);

      // Get rating from cleaner profile or calculate
      const rating = 4.5; // Default, should come from cleaner profile

      setStats({
        totalBookings: bookingsData.length,
        pendingBookings: pending.length,
        totalEarnings,
        pendingEarnings,
        rating,
        completedJobs: completed.length
      });

      // Sort bookings by date
      const sortedBookings = upcomingBookings.sort((a, b) => {
        const dateA = new Date(a.schedule?.date || a.date);
        const dateB = new Date(b.schedule?.date || b.date);
        return dateA - dateB;
      });

      setBookings(sortedBookings);

    } catch (err) {
      console.error('Error loading cleaner dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [safeUser.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  const handleAcceptBooking = async (bookingId) => {
    if (!checkAuthAndAction('accept bookings')) return;
    
    try {
      await bookingService.updateBookingStatus(bookingId, 'confirmed');
      loadDashboardData();
    } catch (error) {
      alert('Failed to accept booking: ' + error.message);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!checkAuthAndAction('reject bookings')) return;
    
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }
    try {
      await bookingService.updateBookingStatus(bookingId, 'cancelled');
      loadDashboardData();
    } catch (error) {
      alert('Failed to reject booking: ' + error.message);
    }
  };

  const handleStartJob = async (bookingId) => {
    if (!checkAuthAndAction('start jobs')) return;
    
    try {
      await bookingService.updateBookingStatus(bookingId, 'in_progress');
      loadDashboardData();
    } catch (error) {
      alert('Failed to start job: ' + error.message);
    }
  };

  const handleCompleteJob = async (bookingId) => {
    if (!checkAuthAndAction('complete jobs')) return;
    
    try {
      await bookingService.updateBookingStatus(bookingId, 'completed');
      loadDashboardData();
    } catch (error) {
      alert('Failed to complete job: ' + error.message);
    }
  };

  const handleToggleAvailability = async () => {
    if (!checkAuthAndAction('update availability')) return;
    
    try {
      const newAvailability = !isAvailable;
      await cleanerService.updateCleanerProfile({ isAvailable: newAvailability });
      setIsAvailable(newAvailability);
    } catch (error) {
      alert('Failed to update availability: ' + error.message);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'confirmed': return '#17a2b8';
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
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
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

  if (error && error.includes('Access Denied')) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard">
          <div className="dashboard-container">
            <div className="empty-state">
              <div className="empty-icon">❌</div>
              <h3>Access Denied</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: '📅',
      label: 'Total Bookings',
      value: stats.totalBookings,
      gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
    },
    {
      icon: '⏳',
      label: 'Pending Bookings',
      value: stats.pendingBookings,
      gradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
    },
    {
      icon: '💰',
      label: 'Total Earnings',
      value: `KSh ${stats.totalEarnings.toLocaleString()}`,
      gradient: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)'
    },
    {
      icon: '⏰',
      label: 'Pending Earnings',
      value: `KSh ${stats.pendingEarnings.toLocaleString()}`,
      gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    },
    {
      icon: '⭐',
      label: 'Rating',
      value: stats.rating.toFixed(1),
      gradient: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)'
    },
    {
      icon: '✅',
      label: 'Completed Jobs',
      value: stats.completedJobs,
      gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1>Welcome to Cleaner Dashboard{currentUser ? `, ${safeUser.name}` : ''}! 👋</h1>
              <p>Manage your bookings and earnings</p>
            </div>
            <div className="header-actions">
              <div className="availability-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={handleToggleAvailability}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Not Authenticated Notice */}
          {!currentUser && (
            <div className="auth-notice">
              <div className="notice-content">
                <span className="notice-icon">ℹ️</span>
                <div>
                  <strong>Sign up to access your cleaner dashboard!</strong>
                  <p>Create an account and apply to become a cleaner to manage bookings, view earnings, and accept jobs.</p>
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

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="quick-stats-section">
            <div className="section-header">
              <div>
                <h2>Overview</h2>
                <p>Your cleaning business at a glance</p>
              </div>
            </div>
            <div className="stats-grid">
              {statCards.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div 
                    className="stat-icon"
                    style={{ background: stat.gradient }}
                  >
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="pending-cleaners-section">
            <div className="section-header">
              <div>
                <h2>Upcoming Bookings</h2>
                <p>Manage your scheduled cleaning appointments</p>
              </div>
            </div>
            
            {bookings.length > 0 ? (
              <div className="bookings-grid">
                {bookings.map(booking => {
                  const bookingId = booking._id || booking.id;
                  const status = booking.status || 'pending';
                  const userName = booking.user?.name || booking.userName || 'Customer';
                  const userPhone = booking.user?.phone || booking.userPhone || 'N/A';
                  const bookingDate = booking.schedule?.date || booking.date;
                  const bookingTime = booking.schedule?.startTime || booking.time;
                  const duration = booking.schedule?.duration || booking.duration || 0;
                  const address = booking.address?.street 
                    ? `${booking.address.street}, ${booking.address.city}` 
                    : booking.address || 'Address not specified';
                  const total = booking.pricing?.totalAmount || booking.total || 0;
                  const serviceType = booking.serviceType || 'Cleaning Service';

                  return (
                    <div key={bookingId} className="booking-card">
                      <div className="booking-header">
                        <h4>{serviceType}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-item">
                          <span className="detail-label">Customer:</span>
                          <span className="detail-value">{userName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{userPhone}</span>
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
                          {status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-approve"
                                onClick={() => handleAcceptBooking(bookingId)}
                              >
                                Accept
                              </button>
                              <button 
                                className="btn btn-reject"
                                onClick={() => handleRejectBooking(bookingId)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {status === 'confirmed' && (
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleStartJob(bookingId)}
                            >
                              Start Job
                            </button>
                          )}
                          {status === 'in_progress' && (
                            <button 
                              className="btn btn-approve"
                              onClick={() => handleCompleteJob(bookingId)}
                            >
                              Complete Job
                            </button>
                          )}
                          <button 
                            className="btn btn-outline"
                            onClick={() => navigate(`/booking/${bookingId}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Upcoming Bookings</h3>
                <p>You don't have any upcoming bookings yet.</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Quick Links</h2>
              <p>Access important features</p>
            </div>
            <div className="quick-actions-grid">
              <div
                className="quick-action-card"
                onClick={() => navigate('/cleaner/profile')}
                role="button"
                tabIndex={0}
              >
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  👤
                </div>
                <div className="action-content">
                  <h3>Update Profile</h3>
                  <p>Edit your cleaner profile</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
              
              <div
                className="quick-action-card"
                onClick={() => navigate('/cleaner/bookings')}
                role="button"
                tabIndex={0}
              >
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' }}>
                  📋
                </div>
                <div className="action-content">
                  <h3>View All Bookings</h3>
                  <p>See all your bookings</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
              
              <div
                className="quick-action-card"
                onClick={() => navigate('/cleaner/earnings')}
                role="button"
                tabIndex={0}
              >
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' }}>
                  💰
                </div>
                <div className="action-content">
                  <h3>View Earnings</h3>
                  <p>Track your earnings</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanerDashboard;

