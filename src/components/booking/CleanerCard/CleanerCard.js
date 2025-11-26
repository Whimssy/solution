import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CleanerCard.css';

const CleanerCard = ({ cleaner }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/cleaner/${cleaner.id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/book/${cleaner.id}`, {
      state: {
        serviceType: cleaner.services[0],
        cleaner: cleaner
      }
    });
  };

  const handleCardClick = () => {
    navigate(`/cleaner/${cleaner.id}`);
  };

  // Default cleaner data structure
  const cleanerData = {
    id: cleaner.id || Math.random().toString(36).substr(2, 9),
    name: cleaner.name || 'Professional Cleaner',
    rating: cleaner.rating || '4.5',
    reviews: cleaner.reviews || 125,
    services: cleaner.services || ['Home Cleaning'],
    price: cleaner.price || 25,
    hourlyRate: cleaner.hourlyRate || 25,
    location: cleaner.location || 'Nairobi',
    experience: cleaner.experience || '2+ years',
    image: cleaner.image || '👩‍💼',
    verified: cleaner.verified || true,
    completedJobs: cleaner.completedJobs || 89
  };

  return (
    <div className="cleaner-card" onClick={handleCardClick}>
      <div className="cleaner-header">
        <div className="cleaner-image">
          <div className="avatar">{cleanerData.image}</div>
          {cleanerData.verified && (
            <div className="verified-badge" title="Verified Cleaner">
              ✓
            </div>
          )}
        </div>
        
        <div className="cleaner-basic-info">
          <h3 className="cleaner-name">{cleanerData.name}</h3>
          <div className="cleaner-meta">
            <span className="location">📍 {cleanerData.location}</span>
            <span className="experience">⏳ {cleanerData.experience}</span>
          </div>
        </div>
      </div>

      <div className="cleaner-rating">
        <div className="rating-stars">
          <span className="stars">⭐ {cleanerData.rating}</span>
          <span className="reviews">({cleanerData.reviews} reviews)</span>
        </div>
        <div className="completed-jobs">
          {cleanerData.completedJobs}+ jobs completed
        </div>
      </div>

      <div className="cleaner-services">
        <div className="services-label">Services:</div>
        <div className="services-tags">
          {cleanerData.services.slice(0, 3).map((service, index) => (
            <span key={index} className="service-tag">{service}</span>
          ))}
          {cleanerData.services.length > 3 && (
            <span className="service-tag more">+{cleanerData.services.length - 3} more</span>
          )}
        </div>
      </div>

      <div className="cleaner-footer">
        <div className="price-section">
          <span className="price">KES {cleanerData.hourlyRate}/hour</span>
          <span className="price-note">Min. 2 hours</span>
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={handleViewProfile}
            className="btn-outline profile-btn"
          >
            View Profile
          </button>
          <button 
            onClick={handleBookNow}
            className="btn-primary book-now-btn"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleanerCard;