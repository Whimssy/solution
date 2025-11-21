// src/services/referralService.js
export const sendReferral = async (referralData) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock contact picker
  const pickContacts = async () => {
    return [
      { name: 'John Friend', phone: '+254712345678' },
      { name: 'Mary Colleague', phone: '+254723456789' }
    ];
  };
  
  // Mock SMS sending
  console.log('Sending referrals:', referralData);
  
  return { success: true, message: 'Referrals sent successfully' };
};