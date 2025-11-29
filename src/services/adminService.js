// Admin service for handling admin-related API calls
import { apiRequest, handleResponse, axiosInstance } from '../config/api';
import logsService from './logsService';

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
   * @param {object} params - Query parameters (status, startDate, endDate, page, limit)
   * @returns {Promise<object>} - All bookings
   */
  async getAllBookings(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const response = await apiRequest(`/admin/bookings${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get all bookings error:', error);
      throw new Error(error.message || 'Failed to fetch all bookings');
    }
  },

  /**
   * Get logs with filters (super admin only)
   * @param {object} params - Filter options (level, startDate, endDate, userId, path, statusCode, search, page, limit)
   * @returns {Promise<object>} - Logs response
   */
  async getLogs(params = {}) {
    try {
      return await logsService.getLogs(params);
    } catch (error) {
      console.error('Get logs error:', error);
      throw new Error(error.message || 'Failed to fetch logs');
    }
  },

  /**
   * Get log statistics (super admin only)
   * @param {object} params - Filter options (startDate, endDate)
   * @returns {Promise<object>} - Log statistics
   */
  async getLogStats(params = {}) {
    try {
      return await logsService.getLogStats(params);
    } catch (error) {
      console.error('Get log stats error:', error);
      throw new Error(error.message || 'Failed to fetch log statistics');
    }
  },

  /**
   * Get a specific log entry by ID (super admin only)
   * @param {string} logId - Log ID
   * @returns {Promise<object>} - Log entry details
   */
  async getLogById(logId) {
    try {
      return await logsService.getLogById(logId);
    } catch (error) {
      console.error('Get log by ID error:', error);
      throw new Error(error.message || 'Failed to fetch log details');
    }
  },

  /**
   * Delete logs based on filters (super admin only)
   * @param {object} params - Filter options (level, startDate, endDate, olderThan)
   * @returns {Promise<object>} - Deletion response
   */
  async deleteLogs(params = {}) {
    try {
      return await logsService.deleteLogs(params);
    } catch (error) {
      console.error('Delete logs error:', error);
      throw new Error(error.message || 'Failed to delete logs');
    }
  },

  /**
   * Create a new user (admin can create users)
   * @param {object} userData - User data (name, email, password, phone, role)
   * @returns {Promise<object>} - Created user
   */
  async createUser(userData) {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  /**
   * Update user (admin can update users)
   * Note: Uses user's own update endpoint, may need admin-specific endpoint
   * @param {string} userId - User ID
   * @param {object} userData - User data to update
   * @returns {Promise<object>} - Updated user
   */
  async updateUser(userId, userData) {
    try {
      // Try admin endpoint first, fallback to user endpoint
      const response = await apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }).catch(() => {
        // Fallback: Note that this may not work for admin updating other users
        throw new Error('Admin user update endpoint not available. Users can only update their own profiles.');
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  },

  /**
   * Create a new booking (admin can create bookings)
   * @param {object} bookingData - Booking data
   * @returns {Promise<object>} - Created booking
   */
  async createBooking(bookingData) {
    try {
      const response = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Create booking error:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  },

  /**
   * Update booking status (admin can update bookings)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Promise<object>} - Updated booking
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update booking status error:', error);
      throw new Error(error.message || 'Failed to update booking status');
    }
  },

  /**
   * Cancel booking (admin can cancel bookings)
   * @param {string} bookingId - Booking ID
   * @param {string} cancellationReason - Optional cancellation reason
   * @returns {Promise<object>} - Cancelled booking
   */
  async cancelBooking(bookingId, cancellationReason = '') {
    try {
      const response = await apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ cancellationReason }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw new Error(error.message || 'Failed to cancel booking');
    }
  },

  /**
   * Update cleaner profile (admin can update cleaners)
   * @param {string} cleanerId - Cleaner ID
   * @param {object} cleanerData - Cleaner data to update
   * @returns {Promise<object>} - Updated cleaner
   */
  async updateCleaner(cleanerId, cleanerData) {
    try {
      // Use review endpoint for status changes, or cleaner update endpoint
      if (cleanerData.status) {
        return await this.reviewCleaner(cleanerId, cleanerData);
      }
      // For other updates, may need cleaner-specific endpoint
      const response = await apiRequest(`/admin/cleaners/${cleanerId}`, {
        method: 'PUT',
        body: JSON.stringify(cleanerData),
      }).catch(() => {
        throw new Error('Admin cleaner update endpoint not available. Use review endpoint for status changes.');
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update cleaner error:', error);
      throw new Error(error.message || 'Failed to update cleaner');
    }
  },
};

export default adminService;


