// src/pages/CleanerProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import './CleanerProfile.css';

const CleanerProfile = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const { selectCleaner } = useBooking();
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCleanerProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock cleaner data
        const mockCleaners = {
          1: {
            id: 1,
            name: 'Jane Wanjiku',
            rating: '4.8',
            reviews: 127,
            location: 'Westlands, Nairobi',
            experience: '3 years',
            services: ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning'],
            price: 1200,
            languages: ['English', 'Swahili'],
            availability: 'Mon - Sat, 8:00 AM - 6:00 PM',
            description: 'Professional cleaner with 3 years of experience. Specialized in home and office cleaning. Very reliable and detail-oriented.',
            skills: ['Deep Cleaning', 'Organization', 'Time Management'],
            verified: true,
            joined: '2022',
            completedJobs: 245
          },
          2: {
            id: 2,
            name: 'Mary Achieng',
            rating: '4.9',
            reviews: 89,
            location: 'Kilimani, Nairobi',
            experience: '4 years',
            services: ['Deep Cleaning', 'Laundry', 'Ironing'],
            price: 1500,
            languages: ['English', 'Swahili', 'Luo'],
            availability: 'Tue - Sun, 7:00 AM - 7:00 PM',
            description: 'Experienced cleaner specializing in deep cleaning services. Known for attention to detail and excellent customer service.',
            skills: ['Stain Removal', 'Organization', 'Customer Service'],
            verified: true,
            joined: '2021',
            completedJobs: 189
          },
          3: {
            id: 3,
            name: 'Grace Muthoni',
            rating: '4.7',
            reviews: 203,
            location: 'Karen, Nairobi',
            experience: '5 years',
            services: ['Home Cleaning', 'Post-Construction', 'Move-in/Move-out'],
            price: 1800,
            languages: ['English', 'Swahili', 'Kikuyu'],
            availability: 'Mon - Fri, 6:00 AM - 8:00 PM',
            description: 'Professional with 5+ years experience in residential and commercial cleaning. Trusted by many families in Karen area.',
            skills: ['Heavy Cleaning', 'Team Management', 'Quality Control'],
            verified: true,
            joined: '2020',
            completedJobs: 312
          },
          4: {
            id: 4,
            name: 'Susan Akinyi',
            rating: '4.6',
            reviews: 76,
            location: 'Lavington, Nairobi',
            experience: '2 years',
            services: ['Standard Cleaning', 'Daily Cleaning'],
            price: 1000,
            languages: ['English', 'Swahili'],
            availability: 'Mon - Sat, 9:00 AM - 5:00 PM',
            description: 'Reliable and efficient cleaner specializing in regular maintenance cleaning. Great with families and pets.',
            skills: ['Quick Cleaning', 'Pet-friendly', 'Reliability'],
            verified: true,
            joined: '2023',
            completedJobs: 98
          }
        };

        setCleaner(mockCleaners[cleanerId] || mockCleaners[1]);
      } catch (error) {
        console.error('Error fetching cleaner profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCleanerProfile();
  }, [cleanerId]);

  const handleBookNow = () => {
    if (cleaner) {
      selectCleaner(cleaner);
      navigate('/booking');
    }
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
          <button onClick={() => navigate('/search')} className="back-btn">
            ← Back to Search
          </button>
          
          <div className="cleaner-main-info">
            <div className="cleaner-avatar-large">
              {cleaner.name.charAt(0)}
            </div>
            <div className="cleaner-basic-info">
              <h1>{cleaner.name}</h1>
              <div className="rating-badge">
                ⭐ {cleaner.rating} ({cleaner.reviews} reviews)
                {cleaner.verified && <span className="verified-badge">✓ Verified</span>}
              </div>
              <p className="location">📍 {cleaner.location}</p>
            </div>
            <div className="booking-sidebar">
              <div className="price-section">
                <h3>KES {cleaner.price}/hr</h3>
                <button onClick={handleBookNow} className="btn-primary book-now-btn">
                  Book Now
                </button>
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
            About
          </button>
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services & Pricing
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'about' && (
            <div className="about-section">
              <h3>About {cleaner.name}</h3>
              <p>{cleaner.description}</p>
              
              <div className="details-grid">
                <div className="detail-card">
                  <h4>Experience</h4>
                  <p>{cleaner.experience}</p>
                </div>
                <div className="detail-card">
                  <h4>Jobs Completed</h4>
                  <p>{cleaner.completedJobs}+</p>
                </div>
                <div className="detail-card">
                  <h4>Member Since</h4>
                  <p>{cleaner.joined}</p>
                </div>
                <div className="detail-card">
                  <h4>Availability</h4>
                  <p>{cleaner.availability}</p>
                </div>
              </div>

              <div className="skills-section">
                <h4>Skills & Specialties</h4>
                <div className="skills-list">
                  {cleaner.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="languages-section">
                <h4>Languages</h4>
                <div className="languages-list">
                  {cleaner.languages.map((language, index) => (
                    <span key={index} className="language-tag">{language}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="services-section">
              <h3>Services Offered</h3>
              <div className="services-list">
                {cleaner.services.map((service, index) => (
                  <div key={index} className="service-item">
                    <span className="service-name">{service}</span>
                    <span className="service-price">KES {cleaner.price}/hr</span>
                  </div>
                ))}
              </div>
              
              <div className="pricing-info">
                <h4>Pricing Information</h4>
                <ul>
                  <li>Minimum booking: 2 hours</li>
                  <li>Free cancellation up to 24 hours before</li>
                  <li>All cleaning supplies included</li>
                  <li>Transportation costs may apply for distant locations</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <h3>Customer Reviews</h3>
              <div className="reviews-stats">
                <div className="overall-rating">
                  <div className="rating-number">{cleaner.rating}</div>
                  <div className="rating-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                  <div className="rating-count">{cleaner.reviews} reviews</div>
                </div>
              </div>
              
              <div className="reviews-list">
                <div className="review-card">
                  <p>"Excellent service! {cleaner.name} was very thorough and professional."</p>
                  <div className="reviewer">- Sarah M.</div>
                </div>
                <div className="review-card">
                  <p>"My apartment has never been cleaner. Highly recommended!"</p>
                  <div className="reviewer">- John K.</div>
                </div>
                <div className="review-card">
                  <p>"Very reliable and always on time. Great attention to detail."</p>
                  <div className="reviewer">- Grace W.</div>
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