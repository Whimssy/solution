// components/cleaner/CleanerSearch.js
import React, { useState, useEffect } from 'react';
import { searchCleaners } from '../../services/cleanerService';

const CleanerSearch = () => {
  const [cleaners, setCleaners] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    minRating: 0,
    availability: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCleaners();
  }, [filters]);

  const loadCleaners = async () => {
    setLoading(true);
    try {
      const results = await searchCleaners(filters);
      setCleaners(results);
    } catch (error) {
      console.error('Error loading cleaners:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="cleaner-search">
      <div className="search-filters">
        <h3>Find Cleaners</h3>
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="input-field"
          />
          
          <select 
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
            className="select-field"
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
          </select>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.checked)}
            />
            Available Now
          </label>
        </div>
      </div>

      <div className="cleaners-list">
        {loading ? (
          <div className="loading">Loading cleaners...</div>
        ) : (
          cleaners.map(cleaner => (
            <CleanerCard key={cleaner.id} cleaner={cleaner} />
          ))
        )}
      </div>
    </div>
  );
};

const CleanerCard = ({ cleaner }) => {
  const { bookCleaner } = useBooking();

  return (
    <div className="cleaner-card">
      <div className="cleaner-image">
        <img src={cleaner.photo} alt={cleaner.name} />
      </div>
      
      <div className="cleaner-info">
        <h4>{cleaner.name}</h4>
        <div className="rating">
          {'★'.repeat(Math.floor(cleaner.rating))}
          <span className="rating-value">({cleaner.rating})</span>
        </div>
        <p className="bio">{cleaner.bio}</p>
        <p className="location">📍 {cleaner.location}</p>
        
        <div className="cleaner-actions">
          <button 
            onClick={() => bookCleaner(cleaner.id)}
            className="btn-primary"
          >
            Book Now
          </button>
          <button className="btn-secondary">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleanerSearch;