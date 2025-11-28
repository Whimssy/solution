// User service for handling user-related API calls
import { apiRequest, handleResponse } from '../config/api';

export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<object>} - User profile
   */
  async getProfile() {
    try {
      const response = await apiRequest('/users/me', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  },

  /**
   * Update user profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise<object>} - Updated user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * Get user's bookings
   * @returns {Promise<object>} - User's bookings
   */
  async getUserBookings() {
    try {
      const response = await apiRequest('/users/me/bookings', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw new Error(error.message || 'Failed to fetch user bookings');
    }
  },
};

export default userService;


