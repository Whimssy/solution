import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './CleanerCard.css';

const CleanerCard = ({ cleaner }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleViewProfile = () => {
    navigate(`/cleaner/${cleaner.id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    // Check if user is authenticated
    if (!currentUser) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/book/${cleaner.id}`);
      navigate(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    // Check if user is a cleaner (cleaners cannot book other cleaners)
    if (currentUser.role === 'cleaner') {
      alert('Cleaners cannot book other cleaners. Please use a regular user account to make bookings.');
      return;
    }
    
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

  // Format availability schedule
  const formatAvailabilitySchedule = (schedule) => {
    if (!schedule || typeof schedule !== 'object') return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const availableDays = days
      .map((day, index) => schedule[day] ? dayLabels[index] : null)
      .filter(day => day !== null);
    
    return availableDays.length > 0 ? availableDays.join(', ') : 'Not available';
  };

  // Format working hours
  const formatWorkingHours = (workingHours) => {
    if (!workingHours || typeof workingHours !== 'object') {
      return '08:00 - 17:00';
    }
    const start = workingHours.start || '08:00';
    const end = workingHours.end || '17:00';
    return `${start} - ${end}`;
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
    completedJobs: cleaner.completedJobs || 89,
    availabilitySchedule: cleaner.availabilitySchedule || {},
    workingHours: cleaner.workingHours || { start: '08:00', end: '17:00' }
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

      <div className="cleaner-availability">
        <div className="availability-label">Availability:</div>
        <div className="availability-info">
          <div className="availability-days">
            📅 {formatAvailabilitySchedule(cleanerData.availabilitySchedule)}
          </div>
          <div className="availability-hours">
            🕐 {formatWorkingHours(cleanerData.workingHours)}
          </div>
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
          {currentUser && currentUser.role === 'cleaner' ? (
            <button 
              className="btn-primary book-now-btn"
              disabled
              title="Cleaners cannot book other cleaners"
            >
              Unavailable
            </button>
          ) : (
            <button 
              onClick={handleBookNow}
              className="btn-primary book-now-btn"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanerCard;