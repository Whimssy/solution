// Booking service for handling booking-related API calls
import { apiRequest, handleResponse } from '../config/api';

export const bookingService = {
  /**
   * Create a new booking
   * @param {object} bookingData - Booking data (cleanerId, date, time, services, etc.)
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
   * Get user's bookings
   * @returns {Promise<object>} - User's bookings
   */
  async getUserBookings() {
    try {
      const response = await apiRequest('/bookings', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    }
  },

  /**
   * Get cleaner's bookings
   * @returns {Promise<object>} - Cleaner's bookings
   */
  async getCleanerBookings() {
    try {
      const response = await apiRequest('/bookings/cleaner', {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get cleaner bookings error:', error);
      throw new Error(error.message || 'Failed to fetch cleaner bookings');
    }
  },

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<object>} - Booking details
   */
  async getBookingById(bookingId) {
    try {
      const response = await apiRequest(`/bookings/${bookingId}`, {
        method: 'GET',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get booking error:', error);
      throw new Error(error.message || 'Failed to fetch booking details');
    }
  },

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (pending, confirmed, in_progress, completed, cancelled)
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
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<object>} - Cancelled booking
   */
  async cancelBooking(bookingId) {
    try {
      const response = await apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw new Error(error.message || 'Failed to cancel booking');
    }
  },
};

export default bookingService;


