// src/services/cleanerService.js
export const searchCleaners = async (filters = {}) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  const mockCleaners = [
    {
      id: '1',
      name: 'Jane Smith',
      photo: 'https://via.placeholder.com/100',
      rating: 4.5,
      bio: 'Professional cleaner with 5 years experience. Specialized in home cleaning.',
      location: 'Nairobi',
      available: true,
      reviews: [
        { rating: 5, comment: 'Excellent service!' },
        { rating: 4, comment: 'Very thorough cleaning' }
      ]
    },
    {
      id: '2',
      name: 'John Doe',
      photo: 'https://via.placeholder.com/100',
      rating: 4.2,
      bio: 'Reliable and efficient cleaning services.',
      location: 'Mombasa',
      available: true,
      reviews: [
        { rating: 4, comment: 'Good job' },
        { rating: 5, comment: 'Highly recommended' }
      ]
    }
  ];

  let results = mockCleaners;

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

  return results;
};