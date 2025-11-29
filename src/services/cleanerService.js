// src/services/cleanerService.js
import { apiRequest, handleResponse } from '../config/api';

// Cache for search results
let searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cleanerService = {
  /**
   * Search for cleaners with filters
   * @param {object} filters - Search filters (city, state, serviceType, minRating, maxPrice, isAvailable, page, limit)
   * @returns {Promise<object>} - Search results
   */
  async searchCleaners(filters = {}) {
    try {
      // Generate cache key based on filters
      const cacheKey = JSON.stringify(filters);
      const cached = searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.serviceType) queryParams.append('serviceType', filters.serviceType);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.isAvailable !== undefined) queryParams.append('isAvailable', filters.isAvailable);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const queryString = queryParams.toString();
      const endpoint = `/cleaners${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      const data = await handleResponse(response);
      
      // Transform API response to match expected format
      const results = (data.data || []).map(cleaner => ({
        id: cleaner._id || cleaner.id,
        name: cleaner.user?.name || cleaner.name,
        photo: cleaner.user?.profilePhoto || cleaner.photo,
        rating: cleaner.rating?.average || cleaner.rating || 0,
        reviewCount: cleaner.rating?.count || cleaner.reviewCount || 0,
        bio: cleaner.bio || '',
        location: cleaner.user?.address?.city || cleaner.location || '',
        experience: cleaner.experience || 0,
        jobsCompleted: cleaner.servicesCompleted || cleaner.jobsCompleted || 0,
        specialties: cleaner.specialties || [],
        availability: cleaner.isAvailable ? 'Available' : 'Unavailable',
        availabilitySchedule: cleaner.availability || {},
        workingHours: cleaner.workingHours || { start: '08:00', end: '17:00' },
        hourlyRate: cleaner.hourlyRate || 0,
        languages: cleaner.languages || [],
        available: cleaner.isAvailable !== false,
        verified: cleaner.isVerified !== false,
        reviews: cleaner.reviews || [],
      }));

      // Cache the results
      searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return {
        cleaners: results,
        count: data.count || results.length,
        total: data.total || results.length,
        page: data.page || 1,
        pages: data.pages || 1,
      };
    } catch (error) {
      console.error('Search cleaners error:', error);
      throw new Error('Failed to search cleaners. Please try again.');
    }
  },

  /**
   * Get cleaner by ID
   * @param {string} cleanerId - Cleaner ID
   * @returns {Promise<object>} - Cleaner details
   */
  async getCleanerById(cleanerId) {
    try {
      const response = await apiRequest(`/cleaners/${cleanerId}`, {
        method: 'GET',
      });

      const data = await handleResponse(response);
      const cleaner = data.data || data;

      // Transform API response to match expected format
      return {
        id: cleaner._id || cleaner.id,
        name: cleaner.user?.name || cleaner.name,
        photo: cleaner.user?.profilePhoto || cleaner.photo,
        rating: cleaner.rating?.average || cleaner.rating || 0,
        reviewCount: cleaner.rating?.count || cleaner.reviewCount || 0,
        bio: cleaner.bio || '',
        location: cleaner.user?.address?.city || cleaner.location || '',
        experience: cleaner.experience || 0,
        jobsCompleted: cleaner.servicesCompleted || cleaner.jobsCompleted || 0,
        specialties: cleaner.specialties || [],
        availability: cleaner.isAvailable ? 'Available' : 'Unavailable',
        hourlyRate: cleaner.hourlyRate || 0,
        languages: cleaner.languages || [],
        available: cleaner.isAvailable !== false,
        verified: cleaner.isVerified !== false,
        reviews: cleaner.reviews || [],
        address: cleaner.user?.address || cleaner.address,
        email: cleaner.user?.email || cleaner.email,
        phone: cleaner.user?.phone || cleaner.phone,
      };
    } catch (error) {
      console.error('Get cleaner error:', error);
      throw new Error(error.message || 'Failed to get cleaner details.');
    }
  },

  /**
   * Get cleaner reviews
   * @param {string} cleanerId - Cleaner ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<object>} - Reviews data
   */
  async getCleanerReviews(cleanerId, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiRequest(`/cleaners/${cleanerId}/reviews?${queryParams}`, {
        method: 'GET',
      });

      const data = await handleResponse(response);
      
      return {
        reviews: data.data?.reviews || data.reviews || [],
        totalReviews: data.data?.totalReviews || data.totalReviews || 0,
        currentPage: data.page || page,
        totalPages: data.pages || Math.ceil((data.totalReviews || 0) / limit),
        hasMore: (data.page || page) < (data.pages || 1),
      };
    } catch (error) {
      console.error('Get cleaner reviews error:', error);
      // If reviews endpoint doesn't exist, return empty reviews
      return {
        reviews: [],
        totalReviews: 0,
        currentPage: page,
        totalPages: 0,
        hasMore: false,
      };
    }
  },

  /**
   * Add a review for a cleaner
   * @param {string} cleanerId - Cleaner ID
   * @param {object} review - Review data (rating, comment, author)
   * @returns {Promise<object>} - Created review
   */
  async addCleanerReview(cleanerId, review) {
    try {
      const response = await apiRequest(`/cleaners/${cleanerId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment,
          author: review.author || 'Anonymous',
        }),
      });

      const data = await handleResponse(response);
      return data.data || data;
    } catch (error) {
      console.error('Add review error:', error);
      throw new Error(error.message || 'Failed to add review.');
    }
  },

  /**
   * Get available specialties (from cleaners)
   * @returns {Promise<array>} - List of specialties
   */
  async getAvailableSpecialties() {
    try {
      // Get all cleaners and extract specialties
      const response = await apiRequest('/cleaners?limit=100', {
        method: 'GET',
      });

      const data = await handleResponse(response);
      const cleaners = data.data || [];

      const specialties = new Set();
      cleaners.forEach(cleaner => {
        if (cleaner.specialties && Array.isArray(cleaner.specialties)) {
          cleaner.specialties.forEach(specialty => {
            specialties.add(specialty);
          });
        }
      });

      return Array.from(specialties).sort();
    } catch (error) {
      console.error('Get specialties error:', error);
      // Return default specialties as fallback
      return ['residential', 'commercial', 'deep_cleaning', 'move_in_out', 'office', 'post_construction'];
    }
  },

  /**
   * Get popular locations (from cleaners)
   * @returns {Promise<array>} - List of locations
   */
  async getPopularLocations() {
    try {
      // Get all cleaners and extract locations
      const response = await apiRequest('/cleaners?limit=100', {
        method: 'GET',
      });

      const data = await handleResponse(response);
      const cleaners = data.data || [];

      const locations = new Set();
      cleaners.forEach(cleaner => {
        const city = cleaner.user?.address?.city || cleaner.location;
        if (city) {
          locations.add(city);
        }
      });

      return Array.from(locations).sort();
    } catch (error) {
      console.error('Get locations error:', error);
      // Return default locations as fallback
      return ['Nairobi', 'Mombasa', 'Kisumu'];
    }
  },

  /**
   * Check cleaner availability
   * @param {string} cleanerId - Cleaner ID
   * @param {string} date - Date to check
   * @param {string} time - Time to check
   * @returns {Promise<object>} - Availability status
   */
  async checkCleanerAvailability(cleanerId, date, time) {
    try {
      const response = await apiRequest(`/cleaners/${cleanerId}/availability`, {
        method: 'POST',
        body: JSON.stringify({ date, time }),
      });

      const data = await handleResponse(response);
      return data.data || data;
    } catch (error) {
      console.error('Check availability error:', error);
      // Return default availability if endpoint doesn't exist
      return {
        available: true,
        nextAvailable: null,
        message: 'Available for booking',
      };
    }
  },

  // Clear cache (useful for testing or when data should be refreshed)
  clearCache() {
    searchCache.clear();
  },

  /**
   * Get service statistics
   * @returns {Promise<object>} - Service statistics
   */
  async getServiceStats() {
    try {
      // Get all cleaners to calculate stats
      const response = await apiRequest('/cleaners?limit=1000', {
        method: 'GET',
      });

      const data = await handleResponse(response);
      const cleaners = data.data || [];

      const totalCleaners = cleaners.length;
      const totalJobs = cleaners.reduce((sum, cleaner) => sum + (cleaner.servicesCompleted || 0), 0);
      const totalRating = cleaners.reduce((sum, cleaner) => {
        const rating = cleaner.rating?.average || cleaner.rating || 0;
        return sum + rating;
      }, 0);
      const averageRating = totalCleaners > 0 ? Number((totalRating / totalCleaners).toFixed(1)) : 0;
      const availableCleaners = cleaners.filter(c => c.isAvailable !== false).length;
      const topRatedCleaner = cleaners.length > 0 
        ? cleaners.reduce((top, current) => {
            const topRating = top.rating?.average || top.rating || 0;
            const currentRating = current.rating?.average || current.rating || 0;
            return currentRating > topRating ? current : top;
          })
        : null;

      return {
        totalCleaners,
        totalJobs,
        averageRating,
        availableCleaners,
        topRatedCleaner: topRatedCleaner ? {
          id: topRatedCleaner._id || topRatedCleaner.id,
          name: topRatedCleaner.user?.name || topRatedCleaner.name,
          rating: topRatedCleaner.rating?.average || topRatedCleaner.rating || 0,
        } : null,
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error(error.message || 'Failed to load service statistics.');
    }
  },

  /**
   * Apply to become a cleaner
   * @param {object} applicationData - Cleaner application data
   * @returns {Promise<object>} - Application response
   */
  async applyAsCleaner(applicationData) {
    try {
      const response = await apiRequest('/cleaners/apply', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Apply as cleaner error:', error);
      throw new Error(error.message || 'Failed to submit cleaner application');
    }
  },

  /**
   * Update cleaner profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise<object>} - Updated profile
   */
  async updateCleanerProfile(profileData) {
    try {
      const response = await apiRequest('/cleaners/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update cleaner profile error:', error);
      throw new Error(error.message || 'Failed to update cleaner profile');
    }
  },

  /**
   * Get cleaner's bookings
   * @returns {Promise<object>} - Cleaner's bookings
   */
  async getCleanerBookings() {
    try {
      const response = await apiRequest('/cleaners/me/bookings', {
        method: 'GET',
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get cleaner bookings error:', error);
      throw new Error(error.message || 'Failed to fetch cleaner bookings');
    }
  }
};

export default cleanerService;
