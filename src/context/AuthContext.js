import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('madeasy_user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('madeasy_user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        setCurrentUser(response.user);
        localStorage.setItem('madeasy_user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setCurrentUser(response.user);
        localStorage.setItem('madeasy_user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const otpLogin = async (phoneNumber) => {
    setLoading(true);
    try {
      // Simulate SMS sending - in production, integrate with Africa's Talking/Twilio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store for verification
      localStorage.setItem('madeasy_otp', '1234');
      localStorage.setItem('madeasy_phone', phoneNumber);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phoneNumber, enteredOtp) => {
    setLoading(true);
    try {
      const storedOtp = localStorage.getItem('madeasy_otp');
      const storedPhone = localStorage.getItem('madeasy_phone');
      
      if (enteredOtp === '1234' && phoneNumber === storedPhone) {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          phoneNumber,
          name: 'Demo User',
          role: 'user',
          type: 'client',
          createdAt: new Date().toISOString()
        };
        
        setCurrentUser(user);
        localStorage.setItem('madeasy_user', JSON.stringify(user));
        
        localStorage.removeItem('madeasy_otp');
        localStorage.removeItem('madeasy_phone');
        
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid OTP' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('madeasy_user');
    localStorage.removeItem('token');
  };

  const value = {
    user: currentUser,
    currentUser,
    login,
    register,
    otpLogin,
    verifyOtp,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};