import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cleanerService } from '../services/cleanerService';
import { bookingService } from '../services/bookingService';
import './BookingPage.css';

const BookingPage = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Service type mapping
  const serviceTypeOptions = [
    { value: 'regular_cleaning', label: 'Regular Cleaning' },
    { value: 'deep_cleaning', label: 'Deep Cleaning' },
    { value: 'move_in_out', label: 'Move In/Out Cleaning' },
    { value: 'office_cleaning', label: 'Office Cleaning' },
    { value: 'post_construction', label: 'Post Construction Cleaning' }
  ];
  
  // Check authentication and role
  useEffect(() => {
    if (!currentUser) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    // Prevent cleaners from booking other cleaners
    if (currentUser.role === 'cleaner') {
      alert('Cleaners cannot book other cleaners. Please use a regular user account to make bookings.');
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

  // Fetch cleaner details
  useEffect(() => {
    const fetchCleaner = async () => {
      if (!cleanerId) {
        setError('Cleaner ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const cleanerData = await cleanerService.getCleanerById(cleanerId);
        setCleaner(cleanerData);
      } catch (err) {
        console.error('Error fetching cleaner:', err);
        setError(err.message || 'Failed to load cleaner details');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role !== 'cleaner') {
      fetchCleaner();
    }
  }, [cleanerId, currentUser]);

  const [bookingData, setBookingData] = useState({
    serviceType: '',
    date: '',
    time: '',
    duration: 2,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: '',
    bedrooms: 0,
    bathrooms: 0,
    livingRooms: 0,
    kitchens: 0,
    extraTasks: [],
    specialInstructions: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (!cleaner || !cleaner.hourlyRate) return 0;
    const baseAmount = cleaner.hourlyRate * bookingData.duration;
    // You can add extra charges calculation here if needed
    return baseAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!bookingData.serviceType || !bookingData.date || !bookingData.time || 
        !bookingData.street || !bookingData.city || !bookingData.state) {
      setError('Please fill in all required fields');
      return;
    }

    if (!cleaner || !cleanerId) {
      setError('Cleaner information is missing');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate pricing
      const baseAmount = cleaner.hourlyRate * bookingData.duration;
      const extraCharges = 0; // Add extra charges logic if needed
      const discount = 0; // Add discount logic if needed
      const totalAmount = baseAmount + extraCharges - discount;

      // Prepare booking payload according to API documentation
      // Format date properly - ensure it's treated as a future date
      // Create date string in format: YYYY-MM-DD (backend will handle time separately)
      const bookingPayload = {
        cleaner: cleanerId,
        serviceType: bookingData.serviceType,
        schedule: {
          date: bookingData.date, // Send date string - backend will parse it
          startTime: bookingData.time,
          duration: bookingData.duration
        },
        address: {
          street: bookingData.street,
          city: bookingData.city,
          state: bookingData.state,
          zipCode: bookingData.zipCode || '',
          instructions: bookingData.instructions || ''
        },
        details: {
          bedrooms: bookingData.bedrooms || 0,
          bathrooms: bookingData.bathrooms || 0,
          livingRooms: bookingData.livingRooms || 0,
          kitchens: bookingData.kitchens || 0,
          extraTasks: bookingData.extraTasks || [],
          specialInstructions: bookingData.specialInstructions || ''
        },
        pricing: {
          baseAmount,
          extraCharges,
          discount,
          totalAmount
        }
      };

      // Create booking via API
      const result = await bookingService.createBooking(bookingPayload);

      if (result.success && result.data) {
        // Redirect to payment page or booking confirmation
        navigate(`/payment/${result.data._id || result.data.id}`);
      } else {
        setError(result.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="loading">Loading cleaner details...</div>
        </div>
      </div>
    );
  }
  
  if (error && !cleaner) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!cleaner) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="error-message">
            <h3>Cleaner not found</h3>
            <p>The cleaner you're looking for could not be found.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <h1>Book Cleaning Service</h1>
          <p>Schedule your cleaning with {cleaner.name}</p>
        </div>

        <div className="booking-content">
          <div className="cleaner-summary">
            <div className="cleaner-card">
              <div className="cleaner-image">
                {cleaner.photo ? (
                  <img src={cleaner.photo} alt={cleaner.name} />
                ) : (
                  <span>👨‍💼</span>
                )}
              </div>
              <div className="cleaner-info">
                <h3>{cleaner?.name || 'Cleaner'}</h3>
                <div className="rating">
                  ⭐ {(() => {
                    // Safely extract rating value - handle both number and object formats
                    if (!cleaner) return '0.0';
                    
                    const rating = cleaner.rating;
                    let ratingNum = 0;
                    
                    if (rating === null || rating === undefined) {
                      ratingNum = 0;
                    } else if (typeof rating === 'number' && !isNaN(rating)) {
                      ratingNum = rating;
                    } else if (rating && typeof rating === 'object' && 'average' in rating) {
                      ratingNum = Number(rating.average) || 0;
                    } else {
                      ratingNum = Number(rating) || 0;
                    }
                    
                    // Ensure we have a valid number before calling toFixed
                    if (isNaN(ratingNum)) {
                      ratingNum = 0;
                    }
                    
                    return ratingNum.toFixed(1);
                  })()} 
                  ({cleaner?.experience || 0} years experience)
                </div>
                <div className="services">
                  {cleaner.specialties && cleaner.specialties.length > 0
                    ? cleaner.specialties.join(', ')
                    : 'Professional Cleaning Services'}
                </div>
                <div className="price">KSh {cleaner.hourlyRate || 0}/hour</div>
                <div className="location">📍 {cleaner.location || 'Location not specified'}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            <div className="form-section">
              <h3>Service Details</h3>
              
              <div className="form-group">
                <label>Service Type *</label>
                <select 
                  name="serviceType" 
                  value={bookingData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select service type</option>
                  {serviceTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time *</label>
                  <select 
                    name="time" 
                    value={bookingData.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Duration (hours) *</label>
                <select 
                  name="duration" 
                  value={bookingData.duration}
                  onChange={handleInputChange}
                  required
                >
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={5}>5 hours</option>
                  <option value={6}>6 hours</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Location & Instructions</h3>
              
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={bookingData.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={bookingData.city}
                    onChange={handleInputChange}
                    placeholder="Nairobi"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={bookingData.state}
                    onChange={handleInputChange}
                    placeholder="Nairobi"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>ZIP/Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={bookingData.zipCode}
                  onChange={handleInputChange}
                  placeholder="00100"
                />
              </div>

              <div className="form-group">
                <label>Address Instructions</label>
                <textarea
                  name="instructions"
                  value={bookingData.instructions}
                  onChange={handleInputChange}
                  placeholder="Ring doorbell twice, gate code, etc."
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={bookingData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or instructions for the cleaner..."
                  rows="3"
                />
              </div>
            </div>

            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Service:</span>
                  <span>{bookingData.serviceType || 'Not selected'}</span>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>{bookingData.duration} hours</span>
                </div>
                <div className="summary-row">
                  <span>Rate:</span>
                  <span>KSh {cleaner.hourlyRate || 0}/hour</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>KSh {calculateTotal()}</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={submitting}
            >
              {submitting ? 'Creating Booking...' : 'Continue to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;