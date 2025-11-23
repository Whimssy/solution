// src/pages/CleanerSearch.js
import React, { useState, useEffect } from 'react';
import CleanerCard from '../components/booking/CleanerCard';
import './CleanerSearch.css';

const CleanerSearch = () => {
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for cleaners
  useEffect(() => {
    const fetchCleaners = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCleaners = [
          {
            id: 1,
            name: 'Jane Wanjiku',
            rating: '4.8',
            reviews: 127,
            location: 'Westlands, Nairobi',
            experience: '3 years',
            services: 'Home & Office Cleaning',
            price: 1200,
            image: null
          },
          {
            id: 2,
            name: 'Mary Achieng',
            rating: '4.9',
            reviews: 89,
            location: 'Kilimani, Nairobi',
            experience: '4 years',
            services: 'Deep Cleaning, Laundry',
            price: 1500,
            image: null
          },
          {
            id: 3,
            name: 'Grace Muthoni',
            rating: '4.7',
            reviews: 203,
            location: 'Karen, Nairobi',
            experience: '5 years',
            services: 'All Home Services',
            price: 1800,
            image: null
          },
          {
            id: 4,
            name: 'Susan Akinyi',
            rating: '4.6',
            reviews: 76,
            location: 'Lavington, Nairobi',
            experience: '2 years',
            services: 'Standard Cleaning',
            price: 1000,
            image: null
          }
        ];
        
        setCleaners(mockCleaners);
      } catch (error) {
        console.error('Error fetching cleaners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCleaners();
  }, []);

  const filteredCleaners = cleaners.filter(cleaner =>
    cleaner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cleaner.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cleaner.services.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="cleaner-search">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding the best cleaners for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cleaner-search">
      <div className="search-container">
        <div className="search-header">
          <h1>Find Your Perfect Cleaner</h1>
          <p>Browse through our verified and rated cleaning professionals</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, location, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>
            Found {filteredCleaners.length} cleaner{filteredCleaners.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Cleaners Grid */}
        {filteredCleaners.length === 0 ? (
          <div className="no-results">
            <div className="empty-icon">🔍</div>
            <h3>No cleaners found</h3>
            <p>Try adjusting your search terms or browse all cleaners</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="btn-primary"
            >
              Show All Cleaners
            </button>
          </div>
        ) : (
          <div className="cleaners-grid">
            {filteredCleaners.map(cleaner => (
              <CleanerCard key={cleaner.id} cleaner={cleaner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanerSearch;