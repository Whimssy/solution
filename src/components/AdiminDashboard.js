import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingCleaners, setPendingCleaners] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      // TODO: Replace with actual API calls
      const token = localStorage.getItem('token');
      
      // Fetch pending cleaners
      const cleanersResponse = await fetch('/api/admin/cleaners/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const cleanersData = await cleanersResponse.json();
      setPendingCleaners(cleanersData.data || []);

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const statsData = await statsResponse.json();
      setStats(statsData.data || {});

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCleaner = async (userId, status, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/cleaners/${userId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });

      if (response.ok) {
        // Refresh the list
        fetchAdminData();
        alert(`Cleaner application ${status}`);
      }
    } catch (error) {
      console.error('Error reviewing cleaner:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-welcome">
          Welcome, {user?.name} 👋
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'cleaners' ? 'active' : ''}
          onClick={() => setActiveTab('cleaners')}
        >
          👥 Cleaner Applications ({pendingCleaners.length})
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👤 Users
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-stats">
          <div className="stat-cards">
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-number">{stats.totalUsers || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Verified Cleaners</h3>
              <div className="stat-number">{stats.totalCleaners || 0}</div>
            </div>
            <div className="stat-card warning">
              <h3>Pending Applications</h3>
              <div className="stat-number">{stats.pendingCleaners || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <div className="stat-number">{stats.totalBookings || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cleaner Applications Tab */}
      {activeTab === 'cleaners' && (
        <div className="cleaner-applications">
          <h2>Cleaner Applications Pending Review</h2>
          
          {pendingCleaners.length === 0 ? (
            <div className="empty-state">
              <p>No pending applications</p>
            </div>
          ) : (
            <div className="applications-list">
              {pendingCleaners.map(cleaner => (
                <div key={cleaner._id} className="application-card">
                  <div className="application-header">
                    <h4>{cleaner.name}</h4>
                    <span className="application-date">
                      Applied: {new Date(cleaner.cleanerApplication.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="application-details">
                    <p><strong>Email:</strong> {cleaner.email}</p>
                    <p><strong>Phone:</strong> {cleaner.phone}</p>
                    <p><strong>Experience:</strong> {cleaner.cleanerApplication.experience} years</p>
                    <p><strong>Hourly Rate:</strong> KSh {cleaner.cleanerApplication.hourlyRate}</p>
                    <p><strong>Bio:</strong> {cleaner.cleanerApplication.bio}</p>
                    <p><strong>Specialties:</strong> {cleaner.cleanerApplication.specialties?.join(', ')}</p>
                  </div>

                  {/* Documents Preview */}
                  <div className="application-documents">
                    <h5>Documents:</h5>
                    <div className="documents-list">
                      {cleaner.cleanerApplication.documents?.idPhoto && (
                        <a href={cleaner.cleanerApplication.documents.idPhoto} target="_blank" rel="noopener noreferrer">
                          📷 ID Photo
                        </a>
                      )}
                      {cleaner.cleanerApplication.documents?.policeClearance && (
                        <a href={cleaner.cleanerApplication.documents.policeClearance} target="_blank" rel="noopener noreferrer">
                          📄 Police Clearance
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="application-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleReviewCleaner(cleaner._id, 'approved')}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => {
                        const reason = prompt('Please provide reason for rejection:');
                        if (reason) {
                          handleReviewCleaner(cleaner._id, 'rejected', reason);
                        }
                      }}
                    >
                      ❌ Reject
                    </button>
                    <button className="btn-view">
                      👁️ View Full Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-management">
          <h2>User Management</h2>
          <p>User list and management features coming soon...</p>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bookings-management">
          <h2>Booking Management</h2>
          <p>Booking management features coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;