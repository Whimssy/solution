import React, { useState, useEffect } from 'react';
import CleanerCard from '../components/booking/CleanerCard/CleanerCard';
import './CleanerSearch.css';

const CleanerSearch = () => {
  const [cleaners, setCleaners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch cleaners from API
  useEffect(() => {
    const fetchCleaners = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/cleaners');
        // const data = await response.json();
        // setCleaners(data);
        
        // For now, set empty array - will be populated by real API
        setCleaners([]);
      } catch (error) {
        console.error('Error fetching cleaners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCleaners();
  }, []);

  // Get all unique services for filter
  const allServices = ['all', ...new Set(cleaners.flatMap(cleaner => cleaner.services))];

  // Filter and sort cleaners
  const filteredCleaners = cleaners
    .filter(cleaner => {
      const matchesSearch = 
        cleaner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleaner.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        cleaner.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesService = selectedService === 'all' || 
        cleaner.services.includes(selectedService);

      const matchesPrice = cleaner.price >= priceRange[0] && 
        cleaner.price <= priceRange[1];

      return matchesSearch && matchesService && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return b.rating - a.rating;
      }
    });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setPriceRange([0, 100]);
    setSortBy('rating');
  };

  if (loading) {
    return (
      <div className="cleaner-search-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Finding the best cleaners for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cleaner-search-page">
      <div className="search-header">
        <div className="header-content">
          <h1>Find Professional Cleaners</h1>
          <p>Book trusted cleaners in your area</p>
        </div>
        
        <div className="search-controls">
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, service, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="control-buttons">
            <button 
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🎛️ Filters
            </button>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="rating">Sort by: Rating</option>
              <option value="price-low">Sort by: Price Low to High</option>
              <option value="price-high">Sort by: Price High to Low</option>
              <option value="experience">Sort by: Experience</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-section">
              <label>Service Type</label>
              <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                className="filter-select"
              >
                {allServices.map(service => (
                  <option key={service} value={service}>
                    {service === 'all' ? 'All Services' : service}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <label>Price Range: KSh {priceRange[0]} - {priceRange[1]}</label>
              <div className="price-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="slider"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Found {filteredCleaners.length} cleaner{filteredCleaners.length !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Cleaners Grid */}
      <div className="cleaners-grid">
        {filteredCleaners.map(cleaner => (
          <CleanerCard key={cleaner.id} cleaner={cleaner} />
        ))}
      </div>

      {/* No Results */}
      {filteredCleaners.length === 0 && !loading && (
        <div className="no-results">
          <div className="no-results-content">
            <span className="no-results-icon">🔍</span>
            <h3>No cleaners found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button className="reset-search" onClick={clearFilters}>
              Reset Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanerSearch;