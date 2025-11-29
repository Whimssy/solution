// Admin service for handling admin-related API calls
import { apiRequest, handleResponse } from '../config/api';

export const adminService = {
  /**
   * Admin login
   * @param {object} credentials - Login credentials (email, password)
   * @returns {Promise<object>} - Login response with token and admin data
   */
  async login(credentials) {
    try {
      const response = await apiRequest('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Admin login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<object>} - Dashboard stats
   */
  async getDashboardStats() {
    try {
      const response = await apiRequest('/admin/dashboard', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw new Error(error.message || 'Failed to fetch dashboard statistics');
    }
  },

  /**
   * Get all users (admin)
   * @returns {Promise<object>} - Users list with pagination
   */
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();

      const response = await apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get all users error:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  /**
   * Get pending cleaner applications
   * @returns {Promise<object>} - Pending cleaner applications
   */
  async getPendingCleaners() {
    try {
      const response = await apiRequest('/admin/cleaners/pending', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get pending cleaners error:', error);
      throw new Error(error.message || 'Failed to fetch pending cleaners');
    }
  },

  /**
   * Review cleaner application
   * @param {string} cleanerId - Cleaner ID
   * @param {object} reviewData - Review data (status: 'approved' or 'rejected', comments)
   * @returns {Promise<object>} - Review response
   */
  async reviewCleaner(cleanerId, reviewData) {
    try {
      const response = await apiRequest(`/admin/cleaners/${cleanerId}/review`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Review cleaner error:', error);
      throw new Error(error.message || 'Failed to review cleaner application');
    }
  },

  /**
   * Get all bookings
   * @returns {Promise<object>} - All bookings
   */
  async getAllBookings() {
    try {
      const response = await apiRequest('/admin/bookings', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get all bookings error:', error);
      throw new Error(error.message || 'Failed to fetch all bookings');
    }
  },
};

export default adminService;


