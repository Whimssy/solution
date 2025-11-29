import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import cleanerService from '../services/cleanerService';
import AdminNavbar from '../components/layout/AdminNavbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [logStats, setLogStats] = useState(null);
  const [pendingCleaners, setPendingCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for entity details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEntity, setActiveEntity] = useState(null); // 'users' | 'cleaners' | 'bookings' | 'pendingCleaners' | 'logs'
  const [entityData, setEntityData] = useState([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState(null);
  const [logFilters, setLogFilters] = useState({
    level: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 50
  });

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
    loadDashboardData(parsedUser);
  }, []);

  const loadDashboardData = async (currentUser = user) => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsData = await adminService.getDashboardStats();
      setStats(statsData.data || statsData);

      // Load pending cleaners
      const cleanersData = await adminService.getPendingCleaners();
      setPendingCleaners(cleanersData.data || cleanersData.count ? cleanersData.data : []);

      // Load log stats (only for super_admin)
      if (currentUser?.role === 'super_admin') {
        try {
          const logsStatsData = await adminService.getLogStats();
          setLogStats(logsStatsData.data || logsStatsData);
        } catch (logErr) {
          console.warn('Failed to load log stats:', logErr);
          // Don't fail the whole dashboard if logs fail
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadEntityDataForType = async (type, customFilters = null) => {
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
      } else if (type === 'logs') {
        // Only super_admin can access logs
        if (user?.role !== 'super_admin') {
          setEntityError('Access denied. Only super admins can view logs.');
          return;
        }
        const filtersToUse = customFilters || logFilters;
        const logsResponse = await adminService.getLogs(filtersToUse);
        const logsPayload = logsResponse.data || logsResponse;
        const logs = logsPayload.data || logsPayload;
        setEntityData(Array.isArray(logs) ? logs : []);
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

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await adminService.updateBookingStatus(bookingId, newStatus);
      await loadEntityDataForType('bookings');
      alert('Booking status updated successfully');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert(`Failed to update booking: ${err.message}`);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      const reason = prompt('Enter cancellation reason (optional):') || '';
      await adminService.cancelBooking(bookingId, reason);
      await loadEntityDataForType('bookings');
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(`Failed to cancel booking: ${err.message}`);
    }
  };

  const handleCreateUser = async () => {
    const name = prompt('Enter user name:');
    if (!name) return;
    const email = prompt('Enter user email:');
    if (!email) return;
    const password = prompt('Enter user password:');
    if (!password) return;
    const phone = prompt('Enter user phone (optional):') || '';
    const role = prompt('Enter user role (user/cleaner/admin):') || 'user';

    try {
      await adminService.createUser({ name, email, password, phone, role });
      await loadEntityDataForType('users');
      alert('User created successfully');
    } catch (err) {
      console.error('Error creating user:', err);
      alert(`Failed to create user: ${err.message}`);
    }
  };

  const handleCreateBooking = async () => {
    alert('Booking creation form will be implemented. For now, bookings are created by users.');
    // TODO: Implement full booking creation form
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
    },
    // Logs card - only for super_admin
    ...(user?.role === 'super_admin' ? [{
      icon: '📊',
      label: 'Logs',
      value: logStats?.totalLogs || 0,
      gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
      type: 'logs',
    }] : [])
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
      case 'logs':
        return 'System Logs';
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
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>All Users</h4>
            <button className="btn btn-primary" onClick={handleCreateUser}>
              + Create User
            </button>
          </div>
          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((u) => (
                <tr key={u._id || u.id || u.email}>
                  <td>{u.name || 'N/A'}</td>
                  <td>{u.email || 'N/A'}</td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>{u.role || 'user'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          const newName = prompt('Enter new name:', u.name);
                          if (newName && newName !== u.name) {
                            adminService.updateUser(u._id || u.id, { name: newName })
                              .then(() => {
                                loadEntityDataForType('users');
                                alert('User updated successfully');
                              })
                              .catch(err => alert(`Failed to update user: ${err.message}`));
                          }
                        }}
                        style={{ fontSize: '12px', padding: '4px 8px', marginRight: '4px' }}
                      >
                        Edit
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

    if (activeEntity === 'cleaners') {
      return (
        <div className="admin-modal-table-wrapper">
          <div style={{ marginBottom: '15px' }}>
            <h4>All Cleaners</h4>
          </div>
          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Hourly Rate</th>
                <th>Rating</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((c) => (
                <tr key={c._id || c.id}>
                  <td>{c.name || c.user?.name || '—'}</td>
                  <td>{c.location || c.user?.address?.city || '—'}</td>
                  <td>{c.hourlyRate ? `KSh ${c.hourlyRate.toLocaleString()}` : '—'}</td>
                  <td>{c.rating ? `${typeof c.rating === 'object' ? c.rating.average?.toFixed(1) : c.rating.toFixed ? c.rating.toFixed(1) : c.rating} ⭐` : '—'}</td>
                  <td>{c.isAvailable !== false ? 'Available' : 'Unavailable'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          const newRate = prompt('Enter new hourly rate:', c.hourlyRate);
                          if (newRate && !isNaN(newRate)) {
                            adminService.updateCleaner(c._id || c.id, { hourlyRate: parseFloat(newRate) })
                              .then(() => {
                                loadEntityDataForType('cleaners');
                                alert('Cleaner updated successfully');
                              })
                              .catch(err => alert(`Failed to update cleaner: ${err.message}`));
                          }
                        }}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Edit
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

    if (activeEntity === 'bookings') {
      return (
        <div className="admin-modal-table-wrapper">
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>All Bookings</h4>
            <button className="btn btn-primary" onClick={handleCreateBooking}>
              + Create Booking
            </button>
          </div>
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
                <th>Actions</th>
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
                  <td>
                    <div className="table-actions">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                        style={{ fontSize: '12px', padding: '4px', marginRight: '4px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="payment_pending">Payment Pending</option>
                      </select>
                      {b.status !== 'cancelled' && (
                        <button
                          className="btn btn-reject"
                          onClick={() => handleCancelBooking(b._id)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
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

    if (activeEntity === 'logs') {
      return (
        <div className="admin-modal-table-wrapper">
          {/* Log Filters */}
          <div className="log-filters" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Level:</label>
                <select
                  value={logFilters.level}
                  onChange={(e) => {
                    const newFilters = { ...logFilters, level: e.target.value, page: 1 };
                    setLogFilters(newFilters);
                    setTimeout(() => loadEntityDataForType('logs', newFilters), 0);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="">All Levels</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="http">HTTP</option>
                  <option value="verbose">Verbose</option>
                  <option value="debug">Debug</option>
                  <option value="silly">Silly</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
                <input
                  type="date"
                  value={logFilters.startDate}
                  onChange={(e) => {
                    const newFilters = { ...logFilters, startDate: e.target.value, page: 1 };
                    setLogFilters(newFilters);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
                <input
                  type="date"
                  value={logFilters.endDate}
                  onChange={(e) => {
                    const newFilters = { ...logFilters, endDate: e.target.value, page: 1 };
                    setLogFilters(newFilters);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Search:</label>
                <input
                  type="text"
                  value={logFilters.search}
                  onChange={(e) => setLogFilters({ ...logFilters, search: e.target.value, page: 1 })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      loadEntityDataForType('logs');
                    }
                  }}
                  placeholder="Search logs..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <button
              onClick={() => loadEntityDataForType('logs', logFilters)}
              className="btn btn-primary"
              style={{ marginRight: '10px' }}
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                const clearedFilters = { level: '', startDate: '', endDate: '', search: '', page: 1, limit: 50 };
                setLogFilters(clearedFilters);
                setTimeout(() => loadEntityDataForType('logs', clearedFilters), 100);
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>

          {/* Log Statistics */}
          {logStats && (
            <div className="log-stats" style={{ marginBottom: '20px', padding: '15px', background: '#e8f4f8', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0 }}>Log Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Total Logs:</strong> {logStats.totalLogs?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>Recent Errors:</strong> {logStats.recentErrors || 0}
                </div>
                {logStats.statsByLevel && (
                  <div>
                    <strong>By Level:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {Object.entries(logStats.statsByLevel).map(([level, count]) => (
                        <li key={level}>{level}: {count}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {logStats.statsByStatusCode && (
                  <div>
                    <strong>By Status:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {Object.entries(logStats.statsByStatusCode).map(([status, count]) => (
                        <li key={status}>{status}: {count}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <table className="admin-modal-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Message</th>
                <th>Path</th>
                <th>Status</th>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entityData.map((log) => (
                <tr key={log._id}>
                  <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: log.level === 'error' ? '#fee' : log.level === 'warn' ? '#ffeaa7' : '#e8f4f8',
                      color: log.level === 'error' ? '#c0392b' : log.level === 'warn' ? '#d63031' : '#2d3436'
                    }}>
                      {log.level || '—'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.message || '—'}
                  </td>
                  <td>{log.request?.path || log.path || '—'}</td>
                  <td>{log.response?.statusCode || log.statusCode || '—'}</td>
                  <td>{log.user?.email || log.user?.id || '—'}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={async () => {
                        try {
                          const logDetails = await adminService.getLogById(log._id);
                          alert(JSON.stringify(logDetails.data || logDetails, null, 2));
                        } catch (err) {
                          alert('Failed to load log details: ' + err.message);
                        }
                      }}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      View
                    </button>
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
