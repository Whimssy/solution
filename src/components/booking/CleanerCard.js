// src/components/booking/CleanerCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import './CleanerCard.css';

const CleanerCard = ({ cleaner }) => {
  const navigate = useNavigate();
  const { selectCleaner } = useBooking();

  const handleBookNow = () => {
    console.log('Booking cleaner:', cleaner);
    selectCleaner(cleaner);
    navigate('/booking');
  };

  const handleViewProfile = () => {
    console.log('Viewing profile for cleaner:', cleaner.id);
    navigate(`/cleaner/${cleaner.id}`);
  };

  return (
    <div className="cleaner-card">
      <div className="cleaner-header">
        <div className="cleaner-avatar">
          {cleaner.name?.charAt(0) || 'C'}
        </div>
        <div className="cleaner-info">
          <h3 className="cleaner-name">{cleaner.name}</h3>
          <div className="cleaner-rating">
            ⭐ {cleaner.rating || '5.0'} 
            <span className="review-count">({cleaner.reviews || '50'}+ reviews)</span>
          </div>
        </div>
      </div>

      <div className="cleaner-details">
        <div className="detail-item">
          <span className="label">Location:</span>
          <span className="value">{cleaner.location || 'Nairobi'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Experience:</span>
          <span className="value">{cleaner.experience || '2+ years'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Services:</span>
          <span className="value">{cleaner.services || 'Home & Office Cleaning'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Price:</span>
          <span className="value price">KES {cleaner.price || '1200'}/hr</span>
        </div>
      </div>

      <div className="cleaner-features">
        {cleaner.verified && (
          <span className="feature-tag verified">✓ Verified</span>
        )}
        <span className="feature-tag available">🟢 Available Today</span>
        {cleaner.languages && cleaner.languages.length > 0 && (
          <span className="feature-tag languages">
            🗣️ {cleaner.languages.slice(0, 2).join(', ')}
          </span>
        )}
      </div>

      <div className="cleaner-actions">
        <button className="btn-primary" onClick={handleBookNow}>
          Book Now
        </button>
        <button className="btn-outline" onClick={handleViewProfile}>
          View Profile
        </button>
      </div>
    </div>
  );
};

export default CleanerCard;