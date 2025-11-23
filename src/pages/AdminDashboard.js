// src/pages/AdminDashboard.js
import React, { useEffect } from 'react'; // ✅ Import useEffect once here
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && user && user.type !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!user || user.type !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="admin-welcome">Welcome, {user?.name || 'Admin'}!</p>
      
      <div className="admin-sections">
        <div className="admin-card">
          <h3>👥 User Management</h3>
          <p>Manage clients and cleaners accounts</p>
          <div className="admin-stats">
            <span className="stat">Total Users: 156</span>
            <span className="stat">Active Today: 23</span>
          </div>
          <button className="btn-primary">Manage Users</button>
        </div>
        
        <div className="admin-card">
          <h3>✅ Cleaner Approvals</h3>
          <p>Review and approve cleaner profiles</p>
          <div className="admin-stats">
            <span className="stat">Pending: 12</span>
            <span className="stat">Approved: 89</span>
          </div>
          <button className="btn-primary">Review Applications</button>
        </div>
        
        <div className="admin-card">
          <h3>📊 Booking Monitoring</h3>
          <p>Monitor all booking activities</p>
          <div className="admin-stats">
            <span className="stat">Today: 15</span>
            <span className="stat">This Week: 102</span>
          </div>
          <button className="btn-primary">View Bookings</button>
        </div>
        
        <div className="admin-card">
          <h3>💰 Payment Reports</h3>
          <p>View payment transactions and reports</p>
          <div className="admin-stats">
            <span className="stat">Revenue: KSh 45,680</span>
            <span className="stat">Pending: KSh 12,400</span>
          </div>
          <button className="btn-primary">View Reports</button>
        </div>
        
        <div className="admin-card">
          <h3>📈 Analytics</h3>
          <p>System performance and user analytics</p>
          <div className="admin-stats">
            <span className="stat">Growth: +15%</span>
            <span className="stat">Satisfaction: 94%</span>
          </div>
          <button className="btn-primary">View Analytics</button>
        </div>
        
        <div className="admin-card">
          <h3>⚙️ System Settings</h3>
          <p>Configure platform settings and preferences</p>
          <div className="admin-stats">
            <span className="stat">Services: 8</span>
            <span className="stat">Locations: 12</span>
          </div>
          <button className="btn-primary">Settings</button>
        </div>
      </div>

      <div className="admin-quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="btn-secondary">Send Notification</button>
          <button className="btn-secondary">Generate Report</button>
          <button className="btn-secondary">Backup Data</button>
          <button className="btn-secondary">System Health</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;