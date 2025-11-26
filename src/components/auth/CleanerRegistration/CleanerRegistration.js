import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CleanerRegistration.css';

const CleanerRegistration = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    idNumber: '',
    phoneNumber: currentUser?.phoneNumber || '',
    bio: '',
    services: [],
    experience: '',
    hourlyRate: '',
    location: ''
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const availableServices = [
    'House Cleaning',
    'Office Cleaning',
    'Deep Cleaning',
    'Move-in Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
    'Laundry Services',
    'Ironing Services'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleFileChange = (e, setFileFunction) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('Please upload an image file (JPEG, PNG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        return;
      }
      setFileFunction(file);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!formData.fullName || !formData.age || !formData.idNumber || !formData.phoneNumber) {
      setMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!idPhoto || !profilePhoto) {
      setMessage('Please upload both ID and profile photos');
      setLoading(false);
      return;
    }

    if (formData.services.length === 0) {
      setMessage('Please select at least one service');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create cleaner application
      const application = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser?.id,
        userPhone: currentUser?.phoneNumber,
        ...formData,
        idPhoto: idPhoto.name,
        profilePhoto: profilePhoto.name,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Save to localStorage (replace with API call)
      const existingApplications = JSON.parse(localStorage.getItem('madeasy_cleaner_applications') || '[]');
      localStorage.setItem('madeasy_cleaner_applications', JSON.stringify([...existingApplications, application]));

      setMessage('✅ Application submitted successfully! Our admin team will review it within 1-2 business days.');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          fullName: '',
          age: '',
          idNumber: '',
          phoneNumber: currentUser?.phoneNumber || '',
          bio: '',
          services: [],
          experience: '',
          hourlyRate: '',
          location: ''
        });
        setIdPhoto(null);
        setProfilePhoto(null);
        navigate('/'); // Redirect to home
      }, 3000);
      
    } catch (error) {
      setMessage('❌ Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cleaner-registration">
      <div className="container">
        <div className="registration-header">
          <h1>Become a Madeasy Cleaner</h1>
          <p>Join our platform and start earning today. Complete the form below to apply.</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name as per ID"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Your age"
                  min="18"
                  max="65"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Government ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="National ID number"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+254712345678"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Your area of operation (e.g., Nairobi CBD)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Uploads */}
          <div className="form-section">
            <h3>Identity Verification</h3>
            <div className="upload-grid">
              <div className="upload-group">
                <label className="form-label">Government ID Photo *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setIdPhoto)}
                    className="file-input"
                    required
                  />
                  <div className="upload-placeholder">
                    {idPhoto ? (
                      <div className="file-preview">
                        <span>📄 {idPhoto.name}</span>
                        <button 
                          type="button" 
                          className="remove-file"
                          onClick={() => setIdPhoto(null)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <span className="upload-icon">📷</span>
                        <span>Upload ID Photo</span>
                        <small>Clear photo of your government ID</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="upload-group">
                <label className="form-label">Profile Photo *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setProfilePhoto)}
                    className="file-input"
                    required
                  />
                  <div className="upload-placeholder">
                    {profilePhoto ? (
                      <div className="file-preview">
                        <span>📷 {profilePhoto.name}</span>
                        <button 
                          type="button" 
                          className="remove-file"
                          onClick={() => setProfilePhoto(null)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <span className="upload-icon">👤</span>
                        <span>Upload Profile Photo</span>
                        <small>Clear face photo for your profile</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="form-section">
            <h3>Service Details</h3>
            
            <div className="form-group">
              <label className="form-label">Services Offered *</label>
              <div className="services-grid">
                {availableServices.map(service => (
                  <label key={service} className="service-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <span className="checkmark"></span>
                    {service}
                  </label>
                ))}
              </div>
              <div className="selected-services">
                Selected: {formData.services.join(', ') || 'None'}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hourly Rate (KSh)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 500"
                  min="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio/Description</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Tell clients about yourself, your cleaning experience, and why they should choose you..."
                rows="4"
              />
              <div className="char-count">{formData.bio.length}/500 characters</div>
            </div>
          </div>

          {/* Terms and Submission */}
          <div className="form-section">
            <div className="terms-agreement">
              <label className="terms-checkbox">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                I agree to the Terms of Service and confirm that all information provided is accurate and truthful. I understand that providing false information may result in account termination. *
              </label>
            </div>

            {message && (
              <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </button>

            <div className="registration-note">
              <h4>📋 What happens next?</h4>
              <p>
                <strong>1. Application Review:</strong> Our admin team will verify your documents and information (1-2 business days)<br/>
                <strong>2. Background Check:</strong> We'll conduct a basic background verification<br/>
                <strong>3. Profile Activation:</strong> Once approved, your profile will be live on the platform<br/>
                <strong>4. Start Earning:</strong> You'll begin receiving booking requests from clients
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CleanerRegistration;