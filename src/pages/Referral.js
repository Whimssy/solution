// src/pages/Referral.js
import React from 'react';
import ReferralSystem from '../components/referral/ReferralSystem';

const Referral = () => {
  return (
    <div className="referral-page">
      <ReferralSystem cleanerId="cleaner-1" />
    </div>
  );
};

export default Referral;