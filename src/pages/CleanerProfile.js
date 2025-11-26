import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CleanerProfile.css';

const CleanerProfile = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedService, setSelectedService] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCleanerProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockCleaners = {
          1: {
            id: 1,
            name: 'Jane Wanjiku',
            rating: '4.8',
            reviews: 127,
            location: 'Westlands, Nairobi',
            experience: '3 years',
            services: ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Laundry'],
            price: 1200,
            hourlyRate: 1200,
            languages: ['English', 'Swahili'],
            availability: 'Mon - Sat, 8:00 AM - 6:00 PM',
            description: 'Professional cleaner with 3 years of experience. Specialized in home and office cleaning. Very reliable and detail-oriented. I take pride in leaving every space sparkling clean and organized.',
            skills: ['Deep Cleaning', 'Organization', 'Time Management', 'Eco-friendly Products'],
            verified: true,
            joined: '2022',
            completedJobs: 245,
            responseTime: 'Within 1 hour',
            image: '👩‍💼'
          },
          2: {
            id: 2,
            name: 'Mary Achieng',
            rating: '4.9',
            reviews: 89,
            location: 'Kilimani, Nairobi',
            experience: '4 years',
            services: ['Deep Cleaning', 'Laundry', 'Ironing', 'Window Cleaning'],
            price: 1500,
            hourlyRate: 1500,
            languages: ['English', 'Swahili', 'Luo'],
            availability: 'Tue - Sun, 7:00 AM - 7:00 PM',
            description: 'Experienced cleaner specializing in deep cleaning services. Known for attention to detail and excellent customer service. I use professional-grade equipment and eco-friendly cleaning products.',
            skills: ['Stain Removal', 'Organization', 'Customer Service', 'Pet-friendly'],
            verified: true,
            joined: '2021',
            completedJobs: 189,
            responseTime: 'Within 30 minutes',
            image: '👩‍🍳'
          },
          3: {
            id: 3,
            name: 'Grace Muthoni',
            rating: '4.7',
            reviews: 203,
            location: 'Karen, Nairobi',
            experience: '5 years',
            services: ['Home Cleaning', 'Post-Construction', 'Move-in/Move-out', 'Carpet Cleaning'],
            price: 1800,
            hourlyRate: 1800,
            languages: ['English', 'Swahili', 'Kikuyu'],
            availability: 'Mon - Fri, 6:00 AM - 8:00 PM',
            description: 'Professional with 5+ years experience in residential and commercial cleaning. Trusted by many families in Karen area. I bring my own high-quality cleaning supplies and equipment.',
            skills: ['Heavy Cleaning', 'Team Management', 'Quality Control', 'Commercial Cleaning'],
            verified: true,
            joined: '2020',
            completedJobs: 312,
            responseTime: 'Within 2 hours',
            image: '👩‍🎓'
          }
        };

        const selectedCleaner = mockCleaners[cleanerId] || mockCleaners[1];
        setCleaner(selectedCleaner);
        setSelectedService(selectedCleaner.services[0]);
      } catch (error) {
        console.error('Error fetching cleaner profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCleanerProfile();
  }, [cleanerId]);

  const handleBookNow = () => {
    if (cleaner && currentUser) {
      navigate(`/book/${cleaner.id}`, { 
        state: { 
          serviceType: selectedService,
          cleaner: cleaner
        } 
      });
    } else {
      navigate('/login');
    }
  };

  const handleContact = () => {
    alert(`Contact ${cleaner.name} at their registered phone number`);
  };

  if (loading) {
    return (
      <div className="cleaner-profile">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cleaner profile...</p>
        </div>
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="cleaner-profile">
        <div className="error-container">
          <h2>Cleaner Not Found</h2>
          <p>The cleaner profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/search')} className="btn-primary">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cleaner-profile">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="header-content">
            <button onClick={() => navigate('/search')} className="back-btn">
              ← Back to Search
            </button>
            
            <div className="cleaner-main-info">
              <div className="cleaner-avatar-section">
                <div className="cleaner-avatar-large">
                  {cleaner.image}
                </div>
                {cleaner.verified && (
                  <div className="verified-badge-large" title="Verified Cleaner">
                    ✓ Verified
                  </div>
                )}
              </div>
              
              <div className="cleaner-basic-info">
                <h1>{cleaner.name}</h1>
                <div className="rating-section">
                  <div className="rating-badge">
                    <span className="stars">⭐ ⭐ ⭐ ⭐ ⭐</span>
                    <span className="rating-text">{cleaner.rating} ({cleaner.reviews} reviews)</span>
                  </div>
                  <p className="location">📍 {cleaner.location}</p>
                </div>
                
                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-value">{cleaner.experience}</span>
                    <span className="stat-label">Experience</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{cleaner.completedJobs}+</span>
                    <span className="stat-label">Jobs Done</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{cleaner.responseTime}</span>
                    <span className="stat-label">Response Time</span>
                  </div>
                </div>
              </div>

              <div className="booking-sidebar">
                <div className="price-card">
                  <div className="price-section">
                    <h3>KES {cleaner.hourlyRate}/hour</h3>
                    <p className="price-note">Minimum 2 hours booking</p>
                  </div>
                  
                  <div className="service-selection">
                    <label>Select Service:</label>
                    <select 
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="service-select"
                    >
                      {cleaner.services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button onClick={handleBookNow} className="btn-primary book-now-btn">
                    Book {cleaner.name}
                  </button>
                  
                  <button onClick={handleContact} className="btn-outline contact-btn">
                    📞 Contact Cleaner
                  </button>
                  
                  <div className="safety-features">
                    <div className="safety-item">
                      <span className="safety-icon">🛡️</span>
                      <span>Background Verified</span>
                    </div>
                    <div className="safety-item">
                      <span className="safety-icon">💳</span>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            📖 About
          </button>
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🧹 Services & Pricing
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="section-header">
                <h3>About {cleaner.name}</h3>
              </div>
              
              <div className="about-content">
                <div className="description-card">
                  <p>{cleaner.description}</p>
                </div>
                
                <div className="details-grid">
                  <div className="detail-card">
                    <div className="detail-icon">📅</div>
                    <div className="detail-content">
                      <h4>Availability</h4>
                      <p>{cleaner.availability}</p>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">🗣️</div>
                    <div className="detail-content">
                      <h4>Languages</h4>
                      <div className="languages-list">
                        {cleaner.languages.map((language, index) => (
                          <span key={index} className="language-tag">{language}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">🎯</div>
                    <div className="detail-content">
                      <h4>Skills & Specialties</h4>
                      <div className="skills-list">
                        {cleaner.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">⭐</div>
                    <div className="detail-content">
                      <h4>Member Since</h4>
                      <p>{cleaner.joined}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="services-section">
              <div className="section-header">
                <h3>Services & Pricing</h3>
                <p>Professional cleaning services offered by {cleaner.name}</p>
              </div>
              
              <div className="services-grid">
                {cleaner.services.map((service, index) => (
                  <div key={index} className="service-card">
                    <div className="service-icon">✨</div>
                    <div className="service-info">
                      <h4>{service}</h4>
                      <p className="service-description">
                        Professional {service.toLowerCase()} service with attention to detail
                      </p>
                    </div>
                    <div className="service-price">
                      KES {cleaner.hourlyRate}/hour
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pricing-info-card">
                <h4>📋 Service Details</h4>
                <div className="pricing-details">
                  <div className="pricing-item">
                    <span className="pricing-label">Minimum Booking:</span>
                    <span className="pricing-value">2 hours</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Cancellation:</span>
                    <span className="pricing-value">Free up to 24 hours before</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Supplies:</span>
                    <span className="pricing-value">All cleaning materials included</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Transport:</span>
                    <span className="pricing-value">Free within 10km radius</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <div className="section-header">
                <h3>Customer Reviews</h3>
                <p>What clients say about {cleaner.name}</p>
              </div>
              
              <div className="reviews-overview">
                <div className="overall-rating-card">
                  <div className="rating-score">{cleaner.rating}</div>
                  <div className="rating-stars-large">⭐ ⭐ ⭐ ⭐ ⭐</div>
                  <div className="rating-count">{cleaner.reviews} reviews</div>
                </div>
                
                <div className="rating-breakdown">
                  <div className="rating-bar">
                    <span>5 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '85%'}}></div>
                    </div>
                    <span>85%</span>
                  </div>
                  <div className="rating-bar">
                    <span>4 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '12%'}}></div>
                    </div>
                    <span>12%</span>
                  </div>
                  <div className="rating-bar">
                    <span>3 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '2%'}}></div>
                    </div>
                    <span>2%</span>
                  </div>
                  <div className="rating-bar">
                    <span>2 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '1%'}}></div>
                    </div>
                    <span>1%</span>
                  </div>
                </div>
              </div>
              
              <div className="reviews-list">
                <div className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">SM</div>
                    <div className="reviewer-info">
                      <h4>Sarah M.</h4>
                      <div className="review-rating">⭐ ⭐ ⭐ ⭐ ⭐</div>
                    </div>
                    <div className="review-date">2 weeks ago</div>
                  </div>
                  <p className="review-text">
                    "Excellent service! {cleaner.name} was very thorough and professional. 
                    My apartment has never been cleaner. Highly recommended!"
                  </p>
                </div>
                
                <div className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">JK</div>
                    <div className="reviewer-info">
                      <h4>John K.</h4>
                      <div className="review-rating">⭐ ⭐ ⭐ ⭐ ⭐</div>
                    </div>
                    <div className="review-date">1 month ago</div>
                  </div>
                  <p className="review-text">
                    "{cleaner.name} did an amazing job with our office cleaning. 
                    Very reliable and always on time. Great attention to detail."
                  </p>
                </div>
                
                <div className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">GW</div>
                    <div className="reviewer-info">
                      <h4>Grace W.</h4>
                      <div className="review-rating">⭐ ⭐ ⭐ ⭐ ⭐</div>
                    </div>
                    <div className="review-date">2 months ago</div>
                  </div>
                  <p className="review-text">
                    "Professional and efficient. {cleaner.name} handled our move-out cleaning 
                    perfectly. Will definitely book again!"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanerProfile;