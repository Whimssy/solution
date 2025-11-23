// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const validateToken = (token) => {
    return token && token.startsWith('demo-token-');
  };

  const checkAuthStatus = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token && validateToken(token)) {
        setUser(JSON.parse(userData));
      } else {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    }
    setLoading(false);
  };

  const sendOtp = async (phoneNumber) => {
    setError(null);
    console.log('Sending OTP to:', phoneNumber);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      message: 'OTP sent successfully! Use 123456 for demo.' 
    };
  };

  const verifyOtp = async (phoneNumber, otp) => {
    setError(null);
    console.log('Verifying OTP:', phoneNumber, otp);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === '123456') {
      let userType = 'client';
      let userName = 'Demo User';
      
      if (phoneNumber.includes('admin') || phoneNumber.includes('777')) {
        userType = 'admin';
        userName = 'Admin User';
      } else if (phoneNumber.includes('cleaner') || phoneNumber.includes('888')) {
        userType = 'cleaner';
        userName = 'Demo Cleaner';
      }
      
      const userData = {
        id: Date.now().toString(),
        phoneNumber,
        name: userName,
        type: userType,
        email: userType === 'admin' ? 'admin@madeasy.com' : 
               userType === 'cleaner' ? 'cleaner@madeasy.com' : 'user@madeasy.com',
        joinedDate: new Date().toISOString(),
        isVerified: true
      };
      
      const token = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { 
        user: userData, 
        token,
        message: `Welcome ${userName}! You are logged in as ${userType}.`
      };
    } else {
      const errorMsg = 'Invalid OTP. Please try 123456 for demo.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserProfile = async (userData) => {
    setError(null);
    try {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const changeUserRole = async (userId, newRole) => {
    setError(null);
    if (user && user.type === 'admin') {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (user.id === userId) {
          const updatedUser = { ...user, type: newRole };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        
        return { success: true, message: `User role updated to ${newRole}` };
      } catch (error) {
        setError(error.message);
        throw error;
      }
    } else {
      const errorMsg = 'Unauthorized: Admin access required';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user && user.type === 'admin';
  };

  const isCleaner = () => {
    return user && user.type === 'cleaner';
  };

  const isClient = () => {
    return user && user.type === 'client';
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    loading,
    error,
    
    // Authentication methods
    sendOtp,
    verifyOtp,
    logout,
    
    // User management
    updateUserProfile,
    changeUserRole,
    
    // Utility functions
    isAuthenticated,
    isAdmin,
    isCleaner,
    isClient,
    getAuthHeaders,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};