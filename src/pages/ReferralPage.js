import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ReferralPage.css';

const ReferralPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="referral-page">
      <div className="container">
        <div className="referral-header">
          <h1>Refer & Earn</h1>
          <p>Share Madeasy with friends and earn rewards</p>
        </div>

        <div className="referral-content">
          <div className="referral-stats">
            <div className="stat-card">
              <h3>Your Referrals</h3>
              <div className="stat-number">0</div>
              <p>People joined</p>
            </div>
            <div className="stat-card">
              <h3>Earned Credits</h3>
              <div className="stat-number">0</div>
              <p>Total credits</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="stat-number">0</div>
              <p>Referrals pending</p>
            </div>
          </div>

          <div className="referral-main">
            <div className="referral-card">
              <h2>Your Referral Code</h2>
              <div className="referral-code">
                <span>MADEASY{currentUser?.phoneNumber?.slice(-4)}</span>
                <button className="btn-copy">Copy</button>
              </div>
              
              <div className="referral-link">
                <p>Your referral link:</p>
                <div className="link-box">
                  https://madeasy.com/signup?ref=MADEASY{currentUser?.phoneNumber?.slice(-4)}
                </div>
              </div>

              <div className="share-section">
                <h3>Share via</h3>
                <div className="share-buttons">
                  <button className="share-btn whatsapp">WhatsApp</button>
                  <button className="share-btn sms">SMS</button>
                  <button className="share-btn link">Copy Link</button>
                </div>
              </div>
            </div>

            <div className="how-it-works">
              <h3>How It Works</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Share Your Code</h4>
                    <p>Share your unique referral code with friends</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>They Sign Up</h4>
                    <p>Your friends sign up using your code</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>You Both Earn</h4>
                    <p>Get 50 credits when they complete their first booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;