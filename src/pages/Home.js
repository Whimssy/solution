import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CleanerCard from '../components/booking/CleanerCard/CleanerCard';
import { cleanerService } from '../services/cleanerService';
import './CleanerSearch.css';
import './Dashboard.css';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const searchSectionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const [cleaners, setCleaners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // Scroll to How It Works section if hash is present
  useEffect(() => {
    if (location.hash === '#how-it-works' && howItWorksRef.current) {
      setTimeout(() => {
        howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  // Fetch cleaners from API
  useEffect(() => {
    const fetchCleaners = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all cleaners (API can internally handle availability/status)
        const result = await cleanerService.searchCleaners({
          limit: 100 // Get a reasonable number of cleaners
        });
        
        // The cleanerService already transforms the data, so use result.cleaners directly
        const cleanersArray = result.cleaners || result.data || [];
        
        // The cleanerService already does the transformation, so we can use the data directly
        // But we need to ensure all required fields are present
        const transformedCleaners = cleanersArray.map(cleaner => ({
          id: cleaner.id,
          name: cleaner.name || 'Unknown Cleaner',
          photo: cleaner.photo || '👨‍💼',
          rating: typeof cleaner.rating === 'number' ? cleaner.rating : (cleaner.rating?.average || 0),
          reviews: cleaner.reviewCount || cleaner.reviews?.length || 0,
          services: cleaner.specialties || [],
          price: cleaner.hourlyRate || 0,
          hourlyRate: cleaner.hourlyRate || 0,
          location: cleaner.location || '',
          experience: cleaner.experience || 0,
          completedJobs: cleaner.jobsCompleted || 0,
          verified: cleaner.verified !== false,
          available: cleaner.available !== false,
          availabilitySchedule: cleaner.availabilitySchedule || {},
          workingHours: cleaner.workingHours || { start: '08:00', end: '17:00' },
          bio: cleaner.bio || ''
        }));
        
        setCleaners(transformedCleaners);
        
        // Update price range based on actual data
        if (transformedCleaners.length > 0) {
          const rates = transformedCleaners.map(c => c.hourlyRate).filter(r => r > 0);
          if (rates.length > 0) {
            const maxRate = Math.max(...rates);
            setPriceRange([0, Math.ceil(maxRate / 100) * 100]); // Round up to nearest 100
          }
        }
      } catch (error) {
        console.error('Error fetching cleaners:', error);
        setError(`Failed to load cleaners: ${error.message || 'Please try again later.'}`);
        setCleaners([]);
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

      const matchesPrice = cleaner.hourlyRate >= priceRange[0] && 
        cleaner.hourlyRate <= priceRange[1];

      return matchesSearch && matchesService && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
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
    // Reset to current max price range
    const maxRate = cleaners.length > 0 
      ? Math.max(...cleaners.map(c => c.hourlyRate).filter(r => r > 0))
      : 10000;
    setPriceRange([0, Math.ceil(maxRate / 100) * 100]);
    setSortBy('rating');
  };

  const handleFindCleaners = () => {
    // Navigate to client dashboard
    navigate('/client/dashboard');
  };

  const handleBecomeCleaner = () => {
    // Check if user is already a cleaner
    const user = currentUser || JSON.parse(localStorage.getItem('madeasy_user') || '{}');
    if (user?.role === 'cleaner') {
      // User is already a cleaner, go to cleaner dashboard
      navigate('/cleaner/dashboard');
    } else {
      // User is not a cleaner, go to registration
      navigate('/become-cleaner');
    }
  };

  const quickActions = [
    {
      icon: '🔍',
      title: 'Find Cleaners',
      description: 'Book professional cleaning services',
      action: handleFindCleaners,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
    },
    {
      icon: '👥',
      title: 'Become a Cleaner',
      description: 'Start earning on our platform',
      action: handleBecomeCleaner,
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
    },
    {
      icon: '📤',
      title: 'Refer & Earn',
      description: 'Share with friends and earn rewards',
      action: () => navigate('/referrals'),
      color: '#9C27B0',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
    }
  ];

  const handleActionClick = (action) => {
    try {
      action();
    } catch (err) {
      console.error('Error executing action:', err);
    }
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
      <div className="search-header" ref={searchSectionRef}>
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
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="slider"
                />
                <input
                  type="range"
                  min="0"
                  max={priceRange[1]}
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

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Results Info */}
      {!error && (
        <div className="results-info">
          <p>
            Found {filteredCleaners.length} cleaner{filteredCleaners.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}

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

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Get things done quickly with these shortcuts</p>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="quick-action-card"
              onClick={() => handleActionClick(action.action)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleActionClick(action.action);
                }
              }}
            >
              <div 
                className="action-icon"
                style={{ background: action.gradient }}
              >
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section" ref={howItWorksRef} id="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Experience seamless cleaning services in just a few clicks</p>
        </div>
        
        <div className="how-it-works-steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">🔍</div>
            <h3>Search & Find</h3>
            <p>Browse through our verified pool of professional cleaners. Use filters to find cleaners based on location, rating, services, and price range that match your needs.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">📅</div>
            <h3>Book Your Service</h3>
            <p>Select your preferred cleaner, choose a convenient date and time, specify your cleaning requirements, and confirm your booking with secure payment options.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">🧹</div>
            <h3>Get It Cleaned</h3>
            <p>Our verified cleaner arrives at your location on time, equipped with professional tools and supplies. Watch them transform your space into a spotless environment.</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">⭐</div>
            <h3>Rate & Review</h3>
            <p>After the service is completed, rate your experience and leave a review. Your feedback helps us maintain quality and helps other users make informed decisions.</p>
          </div>
        </div>

        <div className="how-it-works-features">
          <div className="feature-highlight">
            <h3>Why Choose MADEASY?</h3>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Verified Cleaners</h4>
                  <p>All our cleaners are background-checked and verified for your safety and peace of mind.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Flexible Scheduling</h4>
                  <p>Book cleaning services at your convenience. Choose from daily, weekly, or one-time bookings.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Transparent Pricing</h4>
                  <p>No hidden fees. Clear, upfront pricing so you know exactly what you're paying for.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Secure Payments</h4>
                  <p>Multiple secure payment options including M-Pesa and card payments via Pesapal integration.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Customer Support</h4>
                  <p>24/7 customer support to assist you with any queries or concerns throughout your experience.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Quality Guaranteed</h4>
                  <p>Not satisfied? We work with you to make it right or provide a refund guarantee.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

