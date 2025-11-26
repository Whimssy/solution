// src/services/referralService.js
class ReferralService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.referralCode = this.generateReferralCode();
    this.storageKey = 'cleanify_referral_data';
  }

  // Generate unique referral code
  generateReferralCode() {
    const userId = localStorage.getItem('user_id') || 'user';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${userId}-${random}`;
  }

  // Get user's referral code
  getReferralCode() {
    const stored = this.getStoredData();
    return stored.referralCode || this.referralCode;
  }

  // Main referral sending method
  sendReferral = async (referralData) => {
    try {
      // Validate referral data
      this.validateReferralData(referralData);

      let contacts = [];

      // If contacts are provided, use them
      if (referralData.contacts && referralData.contacts.length > 0) {
        contacts = referralData.contacts;
      } else {
        // Otherwise, use contact picker
        contacts = await this.pickContacts();
      }

      if (contacts.length === 0) {
        throw new Error('No contacts selected');
      }

      // Track referral sending
      await this.trackReferralSent(contacts.length, referralData.method);

      // Send via selected method
      const results = await this.sendViaMethod(contacts, referralData);

      // Store referral data locally
      this.storeReferralData(contacts, referralData.method);

      return {
        success: true,
        message: `Referrals sent successfully to ${results.successCount} contacts`,
        data: {
          totalSent: contacts.length,
          successCount: results.successCount,
          failedCount: results.failedCount,
          failedContacts: results.failedContacts,
          referralCode: this.getReferralCode()
        }
      };

    } catch (error) {
      console.error('Referral sending error:', error);
      
      return {
        success: false,
        error: error.message,
        code: this.getErrorCode(error)
      };
    }
  };

  // Send referral via different methods
  sendViaMethod = async (contacts, referralData) => {
    const method = referralData.method || 'sms';
    const message = this.generateMessage(referralData.message, referralData.customMessage);

    let successCount = 0;
    let failedCount = 0;
    const failedContacts = [];

    for (const contact of contacts) {
      try {
        switch (method) {
          case 'sms':
            await this.sendSMS(contact.phone, message);
            break;
          case 'whatsapp':
            await this.sendWhatsApp(contact.phone, message);
            break;
          case 'email':
            await this.sendEmail(contact.email, message, referralData.subject);
            break;
          case 'link':
            await this.generateShareableLink(contact, message);
            break;
          default:
            throw new Error(`Unsupported sharing method: ${method}`);
        }
        successCount++;
      } catch (error) {
        failedCount++;
        failedContacts.push({
          contact,
          error: error.message
        });
        console.error(`Failed to send to ${contact.name}:`, error);
      }
    }

    return { successCount, failedCount, failedContacts };
  };

  // Generate referral message
  generateMessage = (template, customMessage) => {
    const referralCode = this.getReferralCode();
    const baseUrl = process.env.REACT_APP_BASE_URL || 'https://cleanify.com';
    const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

    if (customMessage) {
      return `${customMessage}\n\nUse my referral code: ${referralCode}\nSign up here: ${referralLink}`;
    }

    const templates = {
      default: `Join Cleanify for professional home cleaning services! Use my referral code ${referralCode} for KES 500 off your first booking. Sign up: ${referralLink}`,
      friendly: `Hey! I've been using Cleanify for my home cleaning and they're amazing! 🏠✨ Use my code ${referralCode} for KES 500 off your first clean. Check them out: ${referralLink}`,
      professional: `I recommend Cleanify for reliable home cleaning services. Professional staff and great results. Use referral code ${referralCode} for a discount: ${referralLink}`
    };

    return templates[template] || templates.default;
  };

  // SMS sharing
  sendSMS = async (phoneNumber, message) => {
    // Simulate SMS API call
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // In a real implementation, integrate with SMS gateway like Africa's Talking
    console.log(`SMS sent to ${phoneNumber}: ${message}`);

    // Mock 10% failure rate for simulation
    if (Math.random() < 0.1) {
      throw new Error('SMS delivery failed');
    }

    return { success: true, method: 'sms' };
  };

  // WhatsApp sharing
  sendWhatsApp = async (phoneNumber, message) => {
    // Format phone number for WhatsApp
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }

    return { success: true, method: 'whatsapp', url: whatsappUrl };
  };

  // Email sharing
  sendEmail = async (email, message, subject = 'Check out Cleanify!') => {
    // Simulate email API call
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

    console.log(`Email sent to ${email}: ${subject} - ${message}`);

    // Mock 5% failure rate for simulation
    if (Math.random() < 0.05) {
      throw new Error('Email delivery failed');
    }

    return { success: true, method: 'email' };
  };

  // Generate shareable link
  generateShareableLink = async (contact, message) => {
    const referralCode = this.getReferralCode();
    const baseUrl = process.env.REACT_APP_BASE_URL || 'https://cleanify.com';
    const shareableLink = `${baseUrl}/invite/${referralCode}`;

    // Return link data for user to copy/share
    return {
      success: true,
      method: 'link',
      link: shareableLink,
      message: message,
      contact: contact
    };
  };

  // Contact picker simulation
  pickContacts = async () => {
    // Simulate contact picker delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock contact data - in real app, use Contacts API or phone numbers
    const mockContacts = [
      { name: 'John Friend', phone: '+254712345678', email: 'john.friend@example.com' },
      { name: 'Mary Colleague', phone: '+254723456789', email: 'mary.colleague@example.com' },
      { name: 'David Neighbor', phone: '+254734567890', email: 'david.neighbor@example.com' },
      { name: 'Sarah Relative', phone: '+254745678901', email: 'sarah.relative@example.com' },
      { name: 'Mike Workmate', phone: '+254756789012', email: 'mike.workmate@example.com' }
    ];

    // Return random selection of 2-4 contacts
    const count = 2 + Math.floor(Math.random() * 3);
    return mockContacts.slice(0, count);
  };

  // Validate referral data
  validateReferralData(referralData) {
    if (!referralData) {
      throw new Error('Referral data is required');
    }

    const allowedMethods = ['sms', 'whatsapp', 'email', 'link'];
    if (referralData.method && !allowedMethods.includes(referralData.method)) {
      throw new Error(`Invalid sharing method. Allowed: ${allowedMethods.join(', ')}`);
    }

    if (referralData.customMessage && referralData.customMessage.length > 500) {
      throw new Error('Custom message must be less than 500 characters');
    }
  }

  // Track referral analytics
  trackReferralSent = async (contactCount, method) => {
    const trackingData = {
      referralCode: this.getReferralCode(),
      contactCount,
      method,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('user_id')
    };

    try {
      // Send to analytics endpoint
      await fetch(`${this.baseUrl}/referrals/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.warn('Failed to track referral:', error);
      // Don't throw error for tracking failures
    }
  };

  // Get referral statistics
  getReferralStats = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const stored = this.getStoredData();
      
      // Mock statistics
      return {
        totalReferrals: stored.sentCount || 0,
        successfulSignups: Math.floor((stored.sentCount || 0) * 0.3), // 30% conversion
        pendingRewards: Math.floor((stored.sentCount || 0) * 0.2), // 20% pending
        earnedRewards: Math.floor((stored.sentCount || 0) * 0.1), // 10% completed
        referralCode: this.getReferralCode(),
        rewardAmount: 500, // KES
        nextRewardThreshold: 5 - ((stored.sentCount || 0) % 5) // Next milestone
      };
    } catch (error) {
      console.error('Failed to get referral stats:', error);
      throw error;
    }
  };

  // Get referral history
  getReferralHistory = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const stored = this.getStoredData();
      return stored.history || [];
    } catch (error) {
      console.error('Failed to get referral history:', error);
      throw error;
    }
  };

  // Check if user has pending rewards
  checkPendingRewards = async () => {
    try {
      const stats = await this.getReferralStats();
      return stats.pendingRewards > 0;
    } catch (error) {
      console.error('Failed to check pending rewards:', error);
      return false;
    }
  };

  // Claim referral reward
  claimReward = async (rewardId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate reward claim
      console.log('Claiming reward:', rewardId);

      return {
        success: true,
        message: 'Reward claimed successfully! KES 500 has been added to your account.',
        rewardId,
        amount: 500,
        claimedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to claim reward:', error);
      throw error;
    }
  };

  // Store referral data locally
  storeReferralData(contacts, method) {
    const stored = this.getStoredData();
    
    const newEntry = {
      id: Date.now().toString(),
      contacts: contacts.map(c => ({ name: c.name, phone: c.phone })),
      method,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    const updatedData = {
      ...stored,
      referralCode: this.getReferralCode(),
      sentCount: (stored.sentCount || 0) + contacts.length,
      lastSent: new Date().toISOString(),
      history: [...(stored.history || []), newEntry]
    };

    localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
  }

  // Get stored referral data
  getStoredData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored referral data:', error);
      return {};
    }
  }

  // Clear referral data (for testing/logout)
  clearReferralData() {
    localStorage.removeItem(this.storageKey);
  }

  // Get error code for different error types
  getErrorCode(error) {
    if (error.message.includes('contact')) return 'NO_CONTACTS';
    if (error.message.includes('method')) return 'INVALID_METHOD';
    if (error.message.includes('message')) return 'INVALID_MESSAGE';
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    return 'UNKNOWN_ERROR';
  }

  // Get available sharing methods
  getSharingMethods() {
    return [
      {
        id: 'sms',
        name: 'SMS',
        icon: '📱',
        description: 'Send via text message',
        supported: true
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: '💬',
        description: 'Share via WhatsApp',
        supported: true
      },
      {
        id: 'email',
        name: 'Email',
        icon: '📧',
        description: 'Send via email',
        supported: true
      },
      {
        id: 'link',
        name: 'Shareable Link',
        icon: '🔗',
        description: 'Copy link to share anywhere',
        supported: true
      }
    ];
  }
}

// Create and export singleton instance
const referralService = new ReferralService();
export default referralService;