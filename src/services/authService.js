// services/authService.js
import { apiRequest, handleResponse, getToken as getApiToken } from '../config/api';

// Storage keys - support both old and new keys for compatibility
const STORAGE_KEYS = {
  TOKEN: 'token', // Primary token storage
  ALT_TOKEN: 'cleanify_token', // Alternative token storage
  REFRESH_TOKEN: 'cleanify_refresh_token',
  USER_DATA: 'madeasy_user', // Primary user data storage
  ALT_USER_DATA: 'cleanify_user_data', // Alternative user data storage
  TOKEN_EXPIRY: 'cleanify_token_expiry'
};

// Token management
const tokenService = {
  getToken() {
    // Check both storage keys for compatibility
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || 
           localStorage.getItem(STORAGE_KEYS.ALT_TOKEN);
  },

  setToken(token) {
    // Store in both keys for compatibility
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ALT_TOKEN, token);
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  setUserData(user) {
    // Store in both keys for compatibility
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ALT_USER_DATA, JSON.stringify(user));
  },

  getUserData() {
    // Check both storage keys for compatibility
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA) || 
                     localStorage.getItem(STORAGE_KEYS.ALT_USER_DATA);
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
  /**
   * Register a new user
   * @param {object} userData - User registration data (name, email, password, phone)
   * @returns {Promise<object>} - Registration response with token and user data
   */
  async register(userData) {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      const data = await handleResponse(response);
      
      // Store token and user data
      if (data.token) {
        tokenService.setToken(data.token);
      }
      if (data.user) {
        tokenService.setUserData(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  },

  /**
   * Login user
   * @param {object} credentials - Login credentials (email, password)
   * @returns {Promise<object>} - Login response with token and user data
   */
  async login(credentials) {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      const data = await handleResponse(response);
      
      // Store token and user data
      if (data.token) {
        tokenService.setToken(data.token);
      }
      if (data.user) {
        tokenService.setUserData(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },

  async sendOtp(phoneNumber) {
    try {
      // Validate phone number format
      if (!phoneNumber || !/^\+?[\d\s\-\(\)]{10,}$/.test(phoneNumber)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/\D/g, '') // Remove non-digit characters
        }),
      });
      
      const data = await handleResponse(response);
      
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
      
      const response = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          otp,
          verificationId // Include if available
        }),
      });
      
      const data = await handleResponse(response);
      
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

      const response = await apiRequest('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      const data = await handleResponse(response);
      
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
        try {
          await this.refreshToken();
        } catch (refreshError) {
          // If refresh fails, try to get user anyway
        }
      }

      const response = await apiRequest('/auth/me', {
        method: 'GET',
      });
      
      const data = await handleResponse(response);
      
      // Store user data (response may have data wrapper)
      const userData = data.data || data;
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

      // Use userService for profile updates (matches backend route)
      const response = await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      const data = await handleResponse(response);
      
      // Update cached user data
      const updatedUser = data.data || data;
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

      const response = await apiRequest('/auth/update-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  },

  async resendOtp(phoneNumber) {
    try {
      const response = await apiRequest('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/\D/g, '')
        }),
      });
      
      const data = await handleResponse(response);
      
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
      apiRequest('/auth/logout', {
        method: 'POST',
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
  },

  // Get token service for external use
  getTokenService() {
    return tokenService;
  }
};

export default authService;