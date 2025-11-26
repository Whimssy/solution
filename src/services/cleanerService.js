// src/services/cleanerService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Request timeout configuration
const REQUEST_TIMEOUT = 8000;

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
      throw new Error('Request timeout - Please try again');
    }
    throw error;
  }
};

// Mock data matching your original screenshot structure
const MOCK_CLEANERS = [
  {
    id: '1',
    name: 'Sarah Achini',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    reviewCount: 127,
    bio: 'Professional home cleaner with expertise in ironing and laundry services. Detail-oriented and reliable.',
    location: 'Kilimani',
    experience: '2 years',
    jobsCompleted: 89,
    specialties: ['Ironing', 'Laundry'],
    availability: '1 week',
    hourlyRate: 800,
    languages: ['English', 'Swahili'],
    available: true,
    verified: true,
    reviews: [
      { id: 1, rating: 5, comment: 'Sarah is amazing! My clothes have never looked better.', author: 'Mary K.', date: '2024-01-10' },
      { id: 2, rating: 4, comment: 'Good service, very professional and punctual.', author: 'James M.', date: '2024-01-05' }
    ]
  },
  {
    id: '2',
    name: 'John Kamau',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    reviewCount: 89,
    bio: 'Office cleaning specialist with move-in cleaning expertise. Thorough and efficient service guaranteed.',
    location: 'Nairobi CBD',
    experience: '3 years',
    jobsCompleted: 89,
    specialties: ['Move-in Cleaning', 'Office Cleaning'],
    availability: 'Immediate',
    hourlyRate: 750,
    languages: ['English', 'Swahili'],
    available: true,
    verified: true,
    reviews: [
      { id: 1, rating: 5, comment: 'John cleaned our new office perfectly! Highly recommended.', author: 'Tech Solutions Ltd', date: '2024-01-12' },
      { id: 2, rating: 4, comment: 'Good move-in cleaning service.', author: 'Sarah W.', date: '2024-01-08' }
    ]
  },
  {
    id: '3',
    name: 'Karen Mose-in',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 156,
    bio: 'Window cleaning expert with 5 years of experience. Crystal clear results every time.',
    location: 'Westlands',
    experience: '5 years',
    jobsCompleted: 89,
    specialties: ['Window Cleaning'],
    availability: '12+ weeks',
    hourlyRate: 900,
    languages: ['English'],
    available: false,
    verified: true,
    reviews: [
      { id: 1, rating: 5, comment: 'Karen made our windows sparkle! Worth every shilling.', author: 'David L.', date: '2024-01-15' },
      { id: 2, rating: 5, comment: 'Professional and thorough window cleaning service.', author: 'Grace N.', date: '2024-01-03' }
    ]
  },
  {
    id: '4',
    name: 'James Muriodi',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    reviewCount: 94,
    bio: 'Experienced ironing specialist with attention to detail. Your clothes are in good hands.',
    location: 'Lunday',
    experience: '6 years',
    jobsCompleted: 89,
    specialties: ['Ironing'],
    availability: 'Immediate',
    hourlyRate: 700,
    languages: ['Swahili'],
    available: true,
    verified: false,
    reviews: [
      { id: 1, rating: 4, comment: 'Good ironing service, reasonable prices.', author: 'Mike T.', date: '2024-01-14' },
      { id: 2, rating: 5, comment: 'James is the best for ironing! Very careful with delicate fabrics.', author: 'Anna P.', date: '2024-01-09' }
    ]
  }
];

// Cache for search results
let searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cleanerService = {
  async searchCleaners(filters = {}) {
    try {
      // Generate cache key based on filters
      const cacheKey = JSON.stringify(filters);
      const cached = searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

      let results = [...MOCK_CLEANERS];

      // Apply filters
      if (filters.location) {
        results = results.filter(cleaner => 
          cleaner.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      if (filters.minRating) {
        results = results.filter(cleaner => cleaner.rating >= filters.minRating);
      }

      if (filters.availability) {
        results = results.filter(cleaner => cleaner.available);
      }

      if (filters.specialties && filters.specialties.length > 0) {
        results = results.filter(cleaner =>
          filters.specialties.some(specialty =>
            cleaner.specialties.some(s => 
              s.toLowerCase().includes(specialty.toLowerCase())
            )
          )
        );
      }

      if (filters.maxHourlyRate) {
        results = results.filter(cleaner => cleaner.hourlyRate <= filters.maxHourlyRate);
      }

      if (filters.verifiedOnly) {
        results = results.filter(cleaner => cleaner.verified);
      }

      // Sort results (default by rating)
      const sortBy = filters.sortBy || 'rating';
      switch (sortBy) {
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'experience':
          results.sort((a, b) => {
            const aExp = parseInt(a.experience) || 0;
            const bExp = parseInt(b.experience) || 0;
            return bExp - aExp;
          });
          break;
        case 'price_low':
          results.sort((a, b) => a.hourlyRate - b.hourlyRate);
          break;
        case 'price_high':
          results.sort((a, b) => b.hourlyRate - a.hourlyRate);
          break;
        case 'jobs_completed':
          results.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
          break;
        default:
          results.sort((a, b) => b.rating - a.rating);
      }

      // Cache the results
      searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('Search cleaners error:', error);
      throw new Error('Failed to search cleaners. Please try again.');
    }
  },

  async getCleanerById(cleanerId) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const cleaner = MOCK_CLEANERS.find(c => c.id === cleanerId);
      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      return cleaner;
    } catch (error) {
      console.error('Get cleaner error:', error);
      throw new Error('Failed to get cleaner details.');
    }
  },

  async getCleanerReviews(cleanerId, page = 1, limit = 10) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const cleaner = MOCK_CLEANERS.find(c => c.id === cleanerId);
      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReviews = cleaner.reviews.slice(startIndex, endIndex);

      return {
        reviews: paginatedReviews,
        totalReviews: cleaner.reviews.length,
        currentPage: page,
        totalPages: Math.ceil(cleaner.reviews.length / limit),
        hasMore: endIndex < cleaner.reviews.length
      };
    } catch (error) {
      console.error('Get cleaner reviews error:', error);
      throw new Error('Failed to load reviews.');
    }
  },

  async addCleanerReview(cleanerId, review) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const cleaner = MOCK_CLEANERS.find(c => c.id === cleanerId);
      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      const newReview = {
        id: Date.now(),
        rating: review.rating,
        comment: review.comment,
        author: review.author || 'Anonymous',
        date: new Date().toISOString().split('T')[0]
      };

      cleaner.reviews.unshift(newReview);
      
      // Update rating (simple average)
      const totalRating = cleaner.reviews.reduce((sum, r) => sum + r.rating, 0);
      cleaner.rating = Number((totalRating / cleaner.reviews.length).toFixed(1));
      cleaner.reviewCount = cleaner.reviews.length;

      return newReview;
    } catch (error) {
      console.error('Add review error:', error);
      throw new Error('Failed to add review.');
    }
  },

  async getAvailableSpecialties() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const specialties = new Set();
      MOCK_CLEANERS.forEach(cleaner => {
        cleaner.specialties.forEach(specialty => {
          specialties.add(specialty);
        });
      });

      return Array.from(specialties).sort();
    } catch (error) {
      console.error('Get specialties error:', error);
      return ['Ironing', 'Laundry', 'Window Cleaning', 'Office Cleaning', 'Move-in Cleaning'];
    }
  },

  async getPopularLocations() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const locations = [...new Set(MOCK_CLEANERS.map(cleaner => cleaner.location))];
      return locations.sort();
    } catch (error) {
      console.error('Get locations error:', error);
      return ['Nairobi CBD', 'Kilimani', 'Westlands', 'Lunday'];
    }
  },

  async checkCleanerAvailability(cleanerId, date, time) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const cleaner = MOCK_CLEANERS.find(c => c.id === cleanerId);
      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      // Simulate availability check (80% chance of being available)
      const isAvailable = Math.random() > 0.2;
      
      return {
        available: isAvailable,
        nextAvailable: isAvailable ? null : 'Tomorrow at 2:00 PM',
        message: isAvailable ? 'Available for booking' : 'Fully booked for selected time'
      };
    } catch (error) {
      console.error('Check availability error:', error);
      throw new Error('Failed to check availability.');
    }
  },

  // Clear cache (useful for testing or when data should be refreshed)
  clearCache() {
    searchCache.clear();
  },

  // Get service statistics
  async getServiceStats() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const totalCleaners = MOCK_CLEANERS.length;
      const totalJobs = MOCK_CLEANERS.reduce((sum, cleaner) => sum + cleaner.jobsCompleted, 0);
      const averageRating = Number((
        MOCK_CLEANERS.reduce((sum, cleaner) => sum + cleaner.rating, 0) / totalCleaners
      ).toFixed(1));

      return {
        totalCleaners,
        totalJobs,
        averageRating,
        availableCleaners: MOCK_CLEANERS.filter(c => c.available).length,
        topRatedCleaner: MOCK_CLEANERS.reduce((top, current) => 
          current.rating > top.rating ? current : top
        )
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error('Failed to load service statistics.');
    }
  }
};

export default cleanerService;
