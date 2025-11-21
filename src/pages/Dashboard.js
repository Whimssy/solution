// src/pages/AdminDashboard.js
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-sections">
        <div className="admin-card">
          <h3>User Management</h3>
          <p>Manage clients and cleaners</p>
        </div>
        <div className="admin-card">
          <h3>Cleaner Approvals</h3>
          <p>Review and approve cleaner profiles</p>
        </div>
        <div className="admin-card">
          <h3>Booking Monitoring</h3>
          <p>Monitor all booking activities</p>
        </div>
        <div className="admin-card">
          <h3>Reports</h3>
          <p>View system reports and analytics</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;