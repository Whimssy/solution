// services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const authService = {
  async sendOtp(phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }
    
    return await response.json();
  },

  async verifyOtp(phoneNumber, otp) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid OTP');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      localStorage.removeItem('token');
      return null;
    }
    
    return await response.json();
  },

  logout() {
    localStorage.removeItem('token');
  }
};