// src/components/cleaner/CleanerSearch.js
import React, { useState, useEffect, useCallback } from 'react';
import { searchCleaners } from '../../services/cleanerService';
import { useBooking } from '../../context/BookingContext';
import { useNavigate } from 'react-router-dom';

// CleanerCard Component
const CleanerCard = ({ cleaner }) => {
  const { selectCleaner } = useBooking();
  const navigate = useNavigate();

  const handleBook = () => {
    console.log('Selecting cleaner:', cleaner);
    selectCleaner(cleaner);
    navigate('/booking');
  };

  const handleViewProfile = () => {
    // For future implementation - view cleaner details
    console.log('Viewing profile:', cleaner.id);
  };

  return (
    <div className="cleaner-card">
      <div className="cleaner-image">
        <img 
          src={cleaner.photo} 
          alt={cleaner.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/100/3498db/ffffff?text=🧹';
          }}
        />
      </div>
      
      <div className="cleaner-info">
        <h4>{cleaner.name}</h4>
        <div className="rating">
          <span className="stars">
            {'★'.repeat(Math.floor(cleaner.rating))}
            {'☆'.repeat(5 - Math.floor(cleaner.rating))}
          </span>
          <span className="rating-value">({cleaner.rating})</span>
        </div>
        <p className="bio">{cleaner.bio}</p>
        <div className="cleaner-details">
          <p className="location">📍 {cleaner.location}</p>
          <p className="availability">
            {cleaner.available ? '✅ Available Now' : '❌ Not Available'}
          </p>
        </div>
        
        <div className="cleaner-actions">
          <button 
            onClick={handleBook} 
            className="btn-primary"
            disabled={!cleaner.available}
          >
            {cleaner.available ? 'Book Now' : 'Not Available'}
          </button>
          <button 
            onClick={handleViewProfile} 
            className="btn-secondary"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// Main CleanerSearch Component
const CleanerSearch = () => {
  const [cleaners, setCleaners] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    minRating: 0,
    availability: true
  });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Load cleaners with useCallback to prevent infinite re-renders
  const loadCleaners = useCallback(async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const results = await searchCleaners(filters);
      setCleaners(results);
    } catch (error) {
      console.error('Error loading cleaners:', error);
      setSearchError('Failed to load cleaners. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load cleaners when filters change
  useEffect(() => {
    loadCleaners();
  }, [loadCleaners]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value 
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      location: '',
      minRating: 0,
      availability: true
    });
  };

  // Get unique locations for suggestions
  const uniqueLocations = [...new Set(cleaners.map(cleaner => cleaner.location))];

  return (
    <div className="cleaner-search">
      <div className="search-header">
        <h1>Find Your Perfect Cleaner</h1>
        <p>Browse through our verified cleaning professionals</p>
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="filters-header">
          <h3>Filter Cleaners</h3>
          <button 
            onClick={handleClearFilters} 
            className="btn-secondary btn-clear"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              placeholder="Enter location (e.g., Nairobi, Mombasa)"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input-field"
              list="location-suggestions"
            />
            <datalist id="location-suggestions">
              {uniqueLocations.map(location => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>

          <div className="filter-item">
            <label htmlFor="minRating">Minimum Rating</label>
            <select 
              id="minRating"
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
              className="select-field"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4+ Stars & Up</option>
              <option value={4.5}>4.5+ Stars & Up</option>
              <option value={5}>5 Stars Only</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.checked)}
              />
              Show Available Cleaners Only
            </label>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="active-filters">
          {filters.location && (
            <span className="active-filter">
              Location: {filters.location}
              <button 
                onClick={() => handleFilterChange('location', '')}
                className="remove-filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.minRating > 0 && (
            <span className="active-filter">
              Min Rating: {filters.minRating}+
              <button 
                onClick={() => handleFilterChange('minRating', 0)}
                className="remove-filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.availability && (
            <span className="active-filter">
              Available Only
              <button 
                onClick={() => handleFilterChange('availability', false)}
                className="remove-filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Finding the best cleaners for you...</p>
          </div>
        )}

        {searchError && (
          <div className="error-state">
            <p>{searchError}</p>
            <button onClick={loadCleaners} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {!loading && !searchError && (
          <>
            <div className="results-header">
              <h3>
                {cleaners.length} Cleaner{cleaners.length !== 1 ? 's' : ''} Found
                {filters.location && ` in ${filters.location}`}
              </h3>
            </div>

            <div className="cleaners-list">
              {cleaners.length > 0 ? (
                cleaners.map(cleaner => (
                  <CleanerCard key={cleaner.id} cleaner={cleaner} />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No Cleaners Found</h3>
                  <p>Try adjusting your filters or search in a different location.</p>
                  <button onClick={handleClearFilters} className="btn-primary">
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CleanerSearch;