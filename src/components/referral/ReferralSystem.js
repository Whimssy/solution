// src/components/referral/ReferralSystem.js
import React, { useState } from 'react';
import { sendReferral } from '../../services/referralService';

const ReferralSystem = ({ cleanerId }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Add this missing function
  const pickContacts = async () => {
    return [
      { name: 'John Friend', phone: '+254712345678' },
      { name: 'Mary Colleague', phone: '+254723456789' },
      { name: 'David Relative', phone: '+254734567890' }
    ];
  };

  const handleContactSelect = async () => {
    try {
      const contacts = await pickContacts();
      setSelectedContacts(contacts);
    } catch (error) {
      console.error('Error picking contacts:', error);
      alert('Failed to pick contacts. Please try again.');
    }
  };

  const handleSendReferrals = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select contacts first');
      return;
    }

    setSending(true);
    try {
      await sendReferral({
        cleanerId,
        contacts: selectedContacts,
        message: message || `Check out this great cleaner on Madeasy! I highly recommend their services.`
      });
      alert(`Referrals sent successfully to ${selectedContacts.length} contacts!`);
      setSelectedContacts([]);
      setMessage('');
    } catch (error) {
      console.error('Error sending referrals:', error);
      alert('Failed to send referrals. Please try again.');
    }
    setSending(false);
  };

  return (
    <div className="referral-system">
      <h3>Refer a Cleaner</h3>
      
      <div className="referral-content">
        <div className="contact-selection">
          <button onClick={handleContactSelect} className="btn-primary">
            Select Contacts
          </button>
          
          {selectedContacts.length > 0 && (
            <div className="selected-contacts">
              <h4>Selected Contacts ({selectedContacts.length})</h4>
              <div className="contacts-list">
                {selectedContacts.map(contact => (
                  <div key={contact.phone} className="contact-item">
                    {contact.name} - {contact.phone}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="message-customization">
          <label>Custom Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            rows={4}
          />
        </div>

        <button 
          onClick={handleSendReferrals}
          disabled={selectedContacts.length === 0 || sending}
          className="btn-primary send-referrals-btn"
        >
          {sending ? 'Sending...' : `Send to ${selectedContacts.length} contacts`}
        </button>
      </div>
    </div>
  );
};

export default ReferralSystem;