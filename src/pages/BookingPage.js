import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BookingPage.css';

const BookingPage = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cleaner, setCleaner] = useState(null);
  const [bookingData, setBookingData] = useState({
    serviceType: '',
    date: '',
    time: '',
    duration: 2,
    address: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock cleaner data
    const mockCleaner = {
      id: cleanerId || '1',
      name: 'John Kamau',
      rating: 4.5,
      services: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning'],
      price: 25,
      image: '/images/cleaner1.jpg',
      experience: '3 years',
      location: 'Nairobi CBD'
    };
    setCleaner(mockCleaner);
    setLoading(false);
  }, [cleanerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (!cleaner) return 0;
    return cleaner.price * bookingData.duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.serviceType || !bookingData.date || !bookingData.time || !bookingData.address) {
      alert('Please fill in all required fields');
      return;
    }

    // Create booking
    const booking = {
      id: Math.random().toString(36).substr(2, 9),
      cleanerId,
      cleanerName: cleaner.name,
      userId: currentUser.id,
      userName: currentUser.name,
      ...bookingData,
      total: calculateTotal(),
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage (replace with API call)
    const existingBookings = JSON.parse(localStorage.getItem('madeasy_bookings') || '[]');
    localStorage.setItem('madeasy_bookings', JSON.stringify([...existingBookings, booking]));
    
    // Redirect to payment
    navigate(`/payment/${booking.id}`);
  };

  if (loading) return <div className="loading">Loading cleaner details...</div>;
  if (!cleaner) return <div className="error">Cleaner not found</div>;

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
              <div className="cleaner-image">👨‍💼</div>
              <div className="cleaner-info">
                <h3>{cleaner.name}</h3>
                <div className="rating">⭐ {cleaner.rating} ({cleaner.experience} experience)</div>
                <div className="services">
                  {cleaner.services.join(', ')}
                </div>
                <div className="price">KSh {cleaner.price}/hour</div>
                <div className="location">📍 {cleaner.location}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
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
                  {cleaner.services.map(service => (
                    <option key={service} value={service}>{service}</option>
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
                <label>Address *</label>
                <textarea
                  name="address"
                  value={bookingData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address..."
                  rows="3"
                  required
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
                  <span>KSh {cleaner.price}/hour</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>KSh {calculateTotal()}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-large">
              Continue to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;