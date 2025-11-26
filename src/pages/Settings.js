// src/pages/Settings.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, updateUserProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    promotionalEmails: false
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUserProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating profile: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating password: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProfileChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <h2>Profile Information</h2>
      <p className="section-description">Update your personal information and contact details</p>
      
      <form onSubmit={handleProfileSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            className="input-field"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleProfileChange}
            className="input-field"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleProfileChange}
            className="input-field"
            placeholder="Enter your phone number"
            disabled
          />
          <small className="field-note">Phone number cannot be changed for security reasons</small>
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="settings-section">
      <h2>Change Password</h2>
      <p className="section-description">Update your password to keep your account secure</p>
      
      <form onSubmit={handlePasswordSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="input-field"
            placeholder="Enter your current password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="input-field"
            placeholder="Enter new password"
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="input-field"
            placeholder="Confirm new password"
            required
            minLength="6"
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h2>Notification Preferences</h2>
      <p className="section-description">Choose how you want to receive notifications and updates</p>
      
      <div className="notifications-list">
        <div className="notification-item">
          <div className="notification-info">
            <h4>Email Notifications</h4>
            <p>Receive updates and booking confirmations via email</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={() => handleNotificationChange('emailNotifications')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>SMS Notifications</h4>
            <p>Get text messages for important updates</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.smsNotifications}
              onChange={() => handleNotificationChange('smsNotifications')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>Push Notifications</h4>
            <p>Receive push notifications on your device</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={() => handleNotificationChange('pushNotifications')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>Booking Reminders</h4>
            <p>Get reminders before your cleaning appointments</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.bookingReminders}
              onChange={() => handleNotificationChange('bookingReminders')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>Promotional Emails</h4>
            <p>Receive special offers and cleaning tips</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.promotionalEmails}
              onChange={() => handleNotificationChange('promotionalEmails')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <button className="btn-primary">
        Save Notification Preferences
      </button>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-section">
      <h2>Privacy Settings</h2>
      <p className="section-description">Manage your data and privacy preferences</p>
      
      <div className="privacy-actions">
        <div className="privacy-item">
          <h4>Data Export</h4>
          <p>Download a copy of your personal data</p>
          <button className="btn-secondary">Export Data</button>
        </div>

        <div className="privacy-item">
          <h4>Account Deletion</h4>
          <p>Permanently delete your account and all associated data</p>
          <button className="btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="fas fa-lock"></i>
            Password
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fas fa-bell"></i>
            Notifications
          </button>
          <button 
            className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <i className="fas fa-shield-alt"></i>
            Privacy
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'password' && renderPasswordTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;