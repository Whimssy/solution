// services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Request timeout configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Helper function for fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Please check your internet connection');
    }
    throw error;
  }
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'cleanify_token',
  REFRESH_TOKEN: 'cleanify_refresh_token',
  USER_DATA: 'cleanify_user_data',
  TOKEN_EXPIRY: 'cleanify_token_expiry'
};

// Token management
const tokenService = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  setUserData(user) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  getUserData() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  setTokenExpiry(expiryTime) {
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  },

  getTokenExpiry() {
    const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    return expiry ? parseInt(expiry) : null;
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry;
  }
};

export const authService = {
  async sendOtp(phoneNumber) {
    try {
      // Validate phone number format
      if (!phoneNumber || !/^\+?[\d\s\-\(\)]{10,}$/.test(phoneNumber)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/\D/g, '') // Remove non-digit characters
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to send OTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store OTP verification ID if provided by backend
      if (data.verificationId) {
        sessionStorage.setItem('otp_verification_id', data.verificationId);
      }
      
      return data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw new Error(error.message || 'Network error - Please check your connection');
    }
  },

  async verifyOtp(phoneNumber, otp) {
    try {
      if (!otp || !/^\d{4,6}$/.test(otp)) {
        throw new Error('Please enter a valid OTP');
      }

      const verificationId = sessionStorage.getItem('otp_verification_id');
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          otp,
          verificationId // Include if available
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `OTP verification failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store tokens and user data
      if (data.token) {
        tokenService.setToken(data.token);
      }
      if (data.refreshToken) {
        tokenService.setRefreshToken(data.refreshToken);
      }
      if (data.user) {
        tokenService.setUserData(data.user);
      }
      if (data.expiresIn) {
        // Set token expiry time (subtract 5 minutes for safety margin)
        const expiryTime = Date.now() + (data.expiresIn * 1000) - (5 * 60 * 1000);
        tokenService.setTokenExpiry(expiryTime);
      }
      
      // Clear verification ID after successful verification
      sessionStorage.removeItem('otp_verification_id');
      
      return data.user || data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  },

  async refreshToken() {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update tokens
      if (data.token) {
        tokenService.setToken(data.token);
      }
      if (data.refreshToken) {
        tokenService.setRefreshToken(data.refreshToken);
      }
      if (data.expiresIn) {
        const expiryTime = Date.now() + (data.expiresIn * 1000) - (5 * 60 * 1000);
        tokenService.setTokenExpiry(expiryTime);
      }

      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      // Return cached user data if token is not expired
      const cachedUser = tokenService.getUserData();
      if (cachedUser && !tokenService.isTokenExpired()) {
        return cachedUser;
      }

      const token = tokenService.getToken();
      if (!token) {
        return null;
      }

      // Refresh token if expired
      if (tokenService.isTokenExpired()) {
        await this.refreshToken();
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenService.getToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, try to refresh
          try {
            await this.refreshToken();
            // Retry the request with new token
            return await this.getCurrentUser();
          } catch (refreshError) {
            this.logout();
            return null;
          }
        }
        throw new Error(`Failed to get user data: ${response.status}`);
      }
      
      const userData = await response.json();
      tokenService.setUserData(userData);
      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      // Don't logout on network errors, return cached data if available
      const cachedUser = tokenService.getUserData();
      return cachedUser || null;
    }
  },

  async updateUserProfile(profileData) {
    try {
      const token = tokenService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      const updatedUser = await response.json();
      
      // Update cached user data
      tokenService.setUserData(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  async updatePassword(currentPassword, newPassword) {
    try {
      const token = tokenService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update password: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  },

  async resendOtp(phoneNumber) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/\D/g, '')
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to resend OTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update verification ID if provided
      if (data.verificationId) {
        sessionStorage.setItem('otp_verification_id', data.verificationId);
      }
      
      return data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw new Error(error.message || 'Failed to resend OTP');
    }
  },

  isAuthenticated() {
    const token = tokenService.getToken();
    if (!token) return false;
    
    // Check if token is expired
    return !tokenService.isTokenExpired();
  },

  logout() {
    // Optional: Call logout endpoint to invalidate token on server
    const token = tokenService.getToken();
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(error => {
        console.error('Logout API call failed:', error);
      });
    }
    
    // Clear all stored data
    tokenService.clearAll();
    sessionStorage.removeItem('otp_verification_id');
  },

  // Utility method to get auth headers for API calls
  getAuthHeaders() {
    const token = tokenService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default authService;