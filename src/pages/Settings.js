// src/pages/Settings.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      
      <div className="settings-container">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your phone number"
              disabled
            />
            <small>Phone number cannot be changed</small>
          </div>

          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>

        <div className="settings-actions">
          <div className="action-card">
            <h3>Notification Preferences</h3>
            <p>Manage how you receive notifications</p>
            <button className="btn-secondary">Manage Notifications</button>
          </div>

          <div className="action-card">
            <h3>Security</h3>
            <p>Update your password and security settings</p>
            <button className="btn-secondary">Security Settings</button>
          </div>

          <div className="action-card">
            <h3>Privacy</h3>
            <p>Control your privacy and data settings</p>
            <button className="btn-secondary">Privacy Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; // ✅ This is a default export