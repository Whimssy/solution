import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingCleaners, setPendingCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem('madeasy_user');
    let parsedUser = null;
    
    try {
      parsedUser = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user:', e);
    }

    if (!parsedUser || (parsedUser.role !== 'admin' && parsedUser.role !== 'super_admin')) {
      setError('Access Denied - You need to be an admin to view this page.');
      setLoading(false);
      return;
    }

    setUser(parsedUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsData = await adminService.getDashboardStats();
      setStats(statsData.data || statsData);

      // Load pending cleaners
      const cleanersData = await adminService.getPendingCleaners();
      setPendingCleaners(cleanersData.data || cleanersData.count ? cleanersData.data : []);

      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCleaner = async (cleanerId, status, rejectionReason = '') => {
    try {
      await adminService.reviewCleaner(cleanerId, { status, rejectionReason });
      // Reload pending cleaners
      const cleanersData = await adminService.getPendingCleaners();
      setPendingCleaners(cleanersData.data || cleanersData.count ? cleanersData.data : []);
      alert(`Cleaner application ${status} successfully`);
    } catch (err) {
      console.error('Error reviewing cleaner:', err);
      alert(`Failed to ${status} cleaner: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
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
              <a href="/admin/login" className="btn btn-primary">Go to Admin Login</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: '👥',
      label: 'Users',
      value: stats?.totalUsers || 0,
      gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
    },
    {
      icon: '🧹',
      label: 'Cleaners',
      value: stats?.totalCleaners || 0,
      gradient: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)'
    },
    {
      icon: '📅',
      label: 'Bookings',
      value: stats?.totalBookings || 0,
      gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    },
    {
      icon: '⏳',
      label: 'Pending Cleaners',
      value: stats?.pendingCleaners || 0,
      gradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1>🎉 Welcome to Admin Dashboard!</h1>
              {user && <p>Logged in as: {user.email} ({user.role})</p>}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Quick Stats Section */}
          {stats && (
            <div className="quick-stats-section">
              <div className="section-header">
                <div>
                  <h2>Quick Stats</h2>
                  <p>Overview of your platform metrics</p>
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
          )}

          {/* Pending Cleaners Section */}
          {pendingCleaners && pendingCleaners.length > 0 && (
            <div className="pending-cleaners-section">
              <div className="section-header">
                <div>
                  <h2>Pending Cleaner Applications</h2>
                  <p>Review and approve cleaner applications</p>
                </div>
              </div>
              <div className="pending-cleaners-list">
                {pendingCleaners.map((cleaner) => (
                  <div key={cleaner._id || cleaner.id} className="cleaner-application-card">
                    <div className="cleaner-application-info">
                      <h4>{cleaner.name || cleaner.user?.name}</h4>
                      <p className="cleaner-email">{cleaner.email || cleaner.user?.email}</p>
                      {cleaner.cleanerApplication?.bio && (
                        <p className="cleaner-bio">{cleaner.cleanerApplication.bio}</p>
                      )}
                    </div>
                    <div className="cleaner-application-actions">
                      <button
                        className="btn btn-approve"
                        onClick={() => handleReviewCleaner(cleaner._id || cleaner.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            handleReviewCleaner(cleaner._id || cleaner.id, 'rejected', reason);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;