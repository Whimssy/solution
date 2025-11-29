import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import cleanerService from '../services/cleanerService';
import AdminNavbar from '../components/layout/AdminNavbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingCleaners, setPendingCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for entity details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEntity, setActiveEntity] = useState(null); // 'users' | 'cleaners' | 'bookings' | 'pendingCleaners'
  const [entityData, setEntityData] = useState([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState(null);

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

  const loadEntityDataForType = async (type) => {
    setEntityLoading(true);
    setEntityError(null);

    try {
      if (type === 'bookings') {
        const bookingsResponse = await adminService.getAllBookings();
        const bookingsPayload = bookingsResponse.data || bookingsResponse;
        const bookings = bookingsPayload.data || bookingsPayload;
        setEntityData(bookings);
      } else if (type === 'users') {
        const usersResponse = await adminService.getAllUsers({ limit: 50 });
        const usersPayload = usersResponse.data || usersResponse;
        const users = usersPayload.data || usersPayload;
        setEntityData(users);
      } else if (type === 'cleaners') {
        const cleanersResult = await cleanerService.searchCleaners({ limit: 50 });
        setEntityData(cleanersResult.cleaners || []);
      } else if (type === 'pendingCleaners') {
        // Reuse already loaded pending cleaners
        setEntityData(pendingCleaners || []);
      }
    } catch (err) {
      console.error('Error loading entity data:', err);
      setEntityError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setEntityLoading(false);
    }
  };

  const openEntityModal = (type) => {
    setActiveEntity(type);
    setIsModalOpen(true);
    loadEntityDataForType(type);
  };

  const closeEntityModal = () => {
    setIsModalOpen(false);
    setActiveEntity(null);
    setEntityData([]);
    setEntityError(null);
  };

  const handleReviewCleaner = async (cleanerId, status, rejectionReason = '') => {
    try {
      // Sanitize the ID - remove any leading colon if present
      let sanitizedId = cleanerId;
      if (typeof sanitizedId === 'string' && sanitizedId.startsWith(':')) {
        sanitizedId = sanitizedId.substring(1);
      }
      
      // Ensure it's a valid string
      sanitizedId = String(sanitizedId).trim();
      
      if (!sanitizedId) {
        alert('Invalid cleaner ID');
        return;
      }

      await adminService.reviewCleaner(sanitizedId, { status, rejectionReason });
      // Reload dashboard stats and pending cleaners
      await loadDashboardData();

      // Also refresh modal data if we are currently viewing pending cleaners
      if (activeEntity === 'pendingCleaners') {
        await loadEntityDataForType('pendingCleaners');
      }
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
      gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      type: 'users',
    },
    {
      icon: '🧹',
      label: 'Cleaners',
      value: stats?.totalCleaners || 0,
      gradient: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
      type: 'cleaners',
    },
    {
      icon: '📅',
      label: 'Bookings',
      value: stats?.totalBookings || 0,
      gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      type: 'bookings',
    },
    {
      icon: '⏳',
      label: 'Pending Cleaners',
      value: stats?.pendingCleaners || 0,
      gradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      type: 'pendingCleaners',
    }
  ];

  const getModalTitle = () => {
    switch (activeEntity) {
      case 'users':
        return 'Users';
      case 'cleaners':
        return 'Cleaners';
      case 'bookings':
        return 'Bookings';
      case 'pendingCleaners':
        return 'Pending Cleaners';
      default:
        return '';
    }
  };

  const renderEntityTable = () => {
    if (entityLoading) {
      return (
        <div className="admin-modal-loading">
          <div className="spinner" />
          <p>Loading {getModalTitle().toLowerCase()}...</p>
        </div>
      );
    }

    if (entityError) {
      return (
        <div className="admin-modal-error">
          <strong>Error:</strong> {entityError}
        </div>
      );
    }

    if (!entityData || entityData.length === 0) {
      return (
        <div className="admin-modal-empty">
          <p>No {getModalTitle().toLowerCase()} found.</p>
        </div>
      );
    }

    if (activeEntity === 'users') {
      return (
        <div className="admin-modal-table-wrapper">
          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((u) => (
                <tr key={u.id || u.email}>
                  <td>{u.name || 'N/A'}</td>
                  <td>{u.email || 'N/A'}</td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>{u.role || 'user'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeEntity === 'cleaners') {
      return (
        <div className="admin-modal-table-wrapper">
          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Hourly Rate</th>
                <th>Rating</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.location || '—'}</td>
                  <td>{c.hourlyRate ? `KSh ${c.hourlyRate.toLocaleString()}` : '—'}</td>
                  <td>{c.rating ? `${c.rating.toFixed ? c.rating.toFixed(1) : c.rating} ⭐` : '—'}</td>
                  <td>{c.availability || c.available ? 'Available' : 'Unavailable'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeEntity === 'bookings') {
      return (
        <div className="admin-modal-table-wrapper">
          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Cleaner</th>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((b) => (
                <tr key={b._id}>
                  <td>{b._id?.slice(-6)}</td>
                  <td>{b.user?.name || '—'}<br /><span className="muted">{b.user?.email}</span></td>
                  <td>{b.cleaner?.user?.name || '—'}<br /><span className="muted">{b.cleaner?.user?.email}</span></td>
                  <td>{b.serviceType || 'Cleaning'}</td>
                  <td>{b.schedule?.date ? new Date(b.schedule.date).toLocaleDateString() : '—'}</td>
                  <td>{b.status}</td>
                  <td>{b.paymentStatus || '—'}</td>
                  <td>{b.pricing?.totalAmount ? `KSh ${b.pricing.totalAmount.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeEntity === 'pendingCleaners') {
      return (
        <div className="admin-modal-table-wrapper">
          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Applied At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((cleaner) => (
                <tr key={cleaner._id || cleaner.id}>
                  <td>{cleaner.name || cleaner.user?.name}</td>
                  <td>{cleaner.email || cleaner.user?.email}</td>
                  <td>{cleaner.phone || cleaner.user?.phone || '—'}</td>
                  <td>{cleaner.cleanerApplication?.experience ?? '—'} yrs</td>
                  <td>
                    {cleaner.cleanerApplication?.appliedAt
                      ? new Date(cleaner.cleanerApplication.appliedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <div className="table-actions">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard-wrapper">
      <AdminNavbar />
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
                  <div
                    key={index}
                    className="stat-card stat-card-clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => openEntityModal(stat.type)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        openEntityModal(stat.type);
                      }
                    }}
                  >
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

          {isModalOpen && (
            <div className="admin-modal-overlay" onClick={closeEntityModal}>
              <div
                className="admin-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-modal-header">
                  <h3>{getModalTitle()}</h3>
                  <button
                    className="admin-modal-close"
                    onClick={closeEntityModal}
                    aria-label="Close details"
                  >
                    ×
                  </button>
                </div>
                {renderEntityTable()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
