import React from 'react';

const AdminDashboard = () => {
  // Check if user is admin
  const userStr = localStorage.getItem('madeasy_user');
  let user = null;
  
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user:', e);
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>❌ Access Denied</h1>
        <p>You need to be an admin to view this page.</p>
        <a href="/admin/login">Go to Admin Login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎉 Welcome to Admin Dashboard!</h1>
      <p>Logged in as: {user.email} ({user.role})</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Quick Stats</h2>
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
          <div style={{ padding: '20px', background: '#3498db', color: 'white', borderRadius: '8px' }}>
            <h3>Users</h3>
            <p>0</p>
          </div>
          <div style={{ padding: '20px', background: '#27ae60', color: 'white', borderRadius: '8px' }}>
            <h3>Cleaners</h3>
            <p>0</p>
          </div>
          <div style={{ padding: '20px', background: '#e74c3c', color: 'white', borderRadius: '8px' }}>
            <h3>Bookings</h3>
            <p>0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;