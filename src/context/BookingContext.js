// src/context/BookingContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  // Step 1: Service Selection
  serviceType: null,
  serviceDetails: null,
  
  // Step 2: Schedule & Frequency
  schedule: {
    date: null,
    time: null,
    frequency: 'once', // once, weekly, biweekly, monthly
    customFrequency: null
  },
  
  // Step 3: Location & Details
  location: {
    address: '',
    apartment: '',
    floor: '',
    specialInstructions: '',
    locationType: 'home' // home, office, other
  },
  
  // Step 4: Cleaner Selection
  selectedCleaner: null,
  cleanerPreferences: {
    genderPreference: null, // male, female, no-preference
    experience: null, // 1-2, 3-5, 5+
    languages: []
  },
  
  // Step 5: Extras & Customization
  extras: {
    suppliesProvided: false,
    deepCleaning: false,
    windowCleaning: false,
    ironing: false,
    laundry: false,
    petFriendly: false,
    ecoFriendly: false
  },
  
  // Booking Summary & Payment
  pricing: {
    basePrice: 0,
    extrasTotal: 0,
    frequencyDiscount: 0,
    totalAmount: 0,
    currency: 'KES'
  },
  
  // Booking Status
  status: 'draft', // draft, pending, confirmed, in_progress, completed, cancelled
  bookingId: null,
  createdAt: null,
  
  // UI State
  currentStep: 1,
  isLoading: false,
  error: null
};

// Action types
const BookingActionTypes = {
  // Navigation
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  
  // Service Selection
  SET_SERVICE_TYPE: 'SET_SERVICE_TYPE',
  SET_SERVICE_DETAILS: 'SET_SERVICE_DETAILS',
  
  // Schedule
  SET_SCHEDULE_DATE: 'SET_SCHEDULE_DATE',
  SET_SCHEDULE_TIME: 'SET_SCHEDULE_TIME',
  SET_FREQUENCY: 'SET_FREQUENCY',
  
  // Location
  SET_LOCATION: 'SET_LOCATION',
  UPDATE_LOCATION_FIELD: 'UPDATE_LOCATION_FIELD',
  
  // Cleaner
  SET_SELECTED_CLEANER: 'SET_SELECTED_CLEANER',
  SET_CLEANER_PREFERENCES: 'SET_CLEANER_PREFERENCES',
  
  // Extras
  TOGGLE_EXTRA: 'TOGGLE_EXTRA',
  UPDATE_EXTRAS: 'UPDATE_EXTRAS',
  
  // Pricing
  UPDATE_PRICING: 'UPDATE_PRICING',
  CALCULATE_TOTAL: 'CALCULATE_TOTAL',
  
  // Booking Management
  CREATE_BOOKING: 'CREATE_BOOKING',
  CONFIRM_BOOKING: 'CONFIRM_BOOKING',
  CANCEL_BOOKING: 'CANCEL_BOOKING',
  UPDATE_BOOKING_STATUS: 'UPDATE_BOOKING_STATUS',
  
  // UI State
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_BOOKING: 'RESET_BOOKING',
  LOAD_BOOKING: 'LOAD_BOOKING'
};

// Pricing configuration
const PRICING_CONFIG = {
  baseRates: {
    standard: 1500,
    deep: 2500,
    move_in: 3500,
    office: 2000
  },
  extras: {
    suppliesProvided: 200,
    deepCleaning: 800,
    windowCleaning: 500,
    ironing: 300,
    laundry: 400,
    petFriendly: 150,
    ecoFriendly: 100
  },
  frequencyDiscounts: {
    once: 0,
    weekly: 0.1,    // 10%
    biweekly: 0.05, // 5%
    monthly: 0.15   // 15%
  }
};

// Reducer function
const bookingReducer = (state, action) => {
  switch (action.type) {
    // Navigation
    case BookingActionTypes.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };

    case BookingActionTypes.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 6)
      };

    case BookingActionTypes.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };

    // Service Selection
    case BookingActionTypes.SET_SERVICE_TYPE:
      return {
        ...state,
        serviceType: action.payload,
        serviceDetails: null
      };

    case BookingActionTypes.SET_SERVICE_DETAILS:
      return {
        ...state,
        serviceDetails: action.payload
      };

    // Schedule
    case BookingActionTypes.SET_SCHEDULE_DATE:
      return {
        ...state,
        schedule: {
          ...state.schedule,
          date: action.payload
        }
      };

    case BookingActionTypes.SET_SCHEDULE_TIME:
      return {
        ...state,
        schedule: {
          ...state.schedule,
          time: action.payload
        }
      };

    case BookingActionTypes.SET_FREQUENCY:
      return {
        ...state,
        schedule: {
          ...state.schedule,
          frequency: action.payload
        }
      };

    // Location
    case BookingActionTypes.SET_LOCATION:
      return {
        ...state,
        location: {
          ...state.location,
          ...action.payload
        }
      };

    case BookingActionTypes.UPDATE_LOCATION_FIELD:
      return {
        ...state,
        location: {
          ...state.location,
          [action.payload.field]: action.payload.value
        }
      };

    // Cleaner
    case BookingActionTypes.SET_SELECTED_CLEANER:
      return {
        ...state,
        selectedCleaner: action.payload
      };

    case BookingActionTypes.SET_CLEANER_PREFERENCES:
      return {
        ...state,
        cleanerPreferences: {
          ...state.cleanerPreferences,
          ...action.payload
        }
      };

    // Extras
    case BookingActionTypes.TOGGLE_EXTRA:
      return {
        ...state,
        extras: {
          ...state.extras,
          [action.payload]: !state.extras[action.payload]
        }
      };

    case BookingActionTypes.UPDATE_EXTRAS:
      return {
        ...state,
        extras: {
          ...state.extras,
          ...action.payload
        }
      };

    // Pricing
    case BookingActionTypes.UPDATE_PRICING:
      return {
        ...state,
        pricing: {
          ...state.pricing,
          ...action.payload
        }
      };

    case BookingActionTypes.CALCULATE_TOTAL:
      const { serviceType, schedule, extras } = state;
      
      // Calculate base price
      const basePrice = PRICING_CONFIG.baseRates[serviceType] || PRICING_CONFIG.baseRates.standard;
      
      // Calculate extras total
      const extrasTotal = Object.keys(extras).reduce((total, extra) => {
        return extras[extra] ? total + (PRICING_CONFIG.extras[extra] || 0) : total;
      }, 0);
      
      // Calculate frequency discount
      const frequencyDiscount = basePrice * (PRICING_CONFIG.frequencyDiscounts[schedule.frequency] || 0);
      
      const totalAmount = basePrice + extrasTotal - frequencyDiscount;
      
      return {
        ...state,
        pricing: {
          basePrice,
          extrasTotal,
          frequencyDiscount,
          totalAmount,
          currency: 'KES'
        }
      };

    // Booking Management
    case BookingActionTypes.CREATE_BOOKING:
      return {
        ...state,
        bookingId: action.payload.bookingId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

    case BookingActionTypes.CONFIRM_BOOKING:
      return {
        ...state,
        status: 'confirmed'
      };

    case BookingActionTypes.CANCEL_BOOKING:
      return {
        ...state,
        status: 'cancelled'
      };

    case BookingActionTypes.UPDATE_BOOKING_STATUS:
      return {
        ...state,
        status: action.payload
      };

    // UI State
    case BookingActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case BookingActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case BookingActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case BookingActionTypes.RESET_BOOKING:
      return {
        ...initialState
      };

    case BookingActionTypes.LOAD_BOOKING:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Create context
const BookingContext = createContext();

// Provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user } = useAuth();

  // Calculate pricing whenever relevant state changes
  useEffect(() => {
    if (state.serviceType) {
      dispatch({ type: BookingActionTypes.CALCULATE_TOTAL });
    }
  }, [state.serviceType, state.schedule.frequency, state.extras]);

  // Actions
  const actions = {
    // Navigation
    setStep: (step) => dispatch({ type: BookingActionTypes.SET_STEP, payload: step }),
    nextStep: () => dispatch({ type: BookingActionTypes.NEXT_STEP }),
    prevStep: () => dispatch({ type: BookingActionTypes.PREV_STEP }),

    // Service Selection
    setServiceType: (serviceType) => {
      dispatch({ type: BookingActionTypes.SET_SERVICE_TYPE, payload: serviceType });
    },
    setServiceDetails: (details) => {
      dispatch({ type: BookingActionTypes.SET_SERVICE_DETAILS, payload: details });
    },

    // Schedule
    setScheduleDate: (date) => {
      dispatch({ type: BookingActionTypes.SET_SCHEDULE_DATE, payload: date });
    },
    setScheduleTime: (time) => {
      dispatch({ type: BookingActionTypes.SET_SCHEDULE_TIME, payload: time });
    },
    setFrequency: (frequency) => {
      dispatch({ type: BookingActionTypes.SET_FREQUENCY, payload: frequency });
    },

    // Location
    setLocation: (location) => {
      dispatch({ type: BookingActionTypes.SET_LOCATION, payload: location });
    },
    updateLocationField: (field, value) => {
      dispatch({ 
        type: BookingActionTypes.UPDATE_LOCATION_FIELD, 
        payload: { field, value } 
      });
    },

    // Cleaner
    setSelectedCleaner: (cleaner) => {
      dispatch({ type: BookingActionTypes.SET_SELECTED_CLEANER, payload: cleaner });
    },
    setCleanerPreferences: (preferences) => {
      dispatch({ type: BookingActionTypes.SET_CLEANER_PREFERENCES, payload: preferences });
    },

    // Extras
    toggleExtra: (extra) => {
      dispatch({ type: BookingActionTypes.TOGGLE_EXTRA, payload: extra });
    },
    updateExtras: (extras) => {
      dispatch({ type: BookingActionTypes.UPDATE_EXTRAS, payload: extras });
    },

    // Booking Management
    createBooking: async (bookingData) => {
      try {
        dispatch({ type: BookingActionTypes.SET_LOADING, payload: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        
        dispatch({ 
          type: BookingActionTypes.CREATE_BOOKING, 
          payload: { bookingId } 
        });
        
        // Save to localStorage for persistence
        const bookingToSave = {
          ...state,
          bookingId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(`booking_${bookingId}`, JSON.stringify(bookingToSave));
        
        return bookingId;
      } catch (error) {
        dispatch({ 
          type: BookingActionTypes.SET_ERROR, 
          payload: 'Failed to create booking' 
        });
        throw error;
      } finally {
        dispatch({ type: BookingActionTypes.SET_LOADING, payload: false });
      }
    },

    confirmBooking: async (bookingId, paymentData) => {
      try {
        dispatch({ type: BookingActionTypes.SET_LOADING, payload: true });
        
        // Simulate payment processing and confirmation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ type: BookingActionTypes.CONFIRM_BOOKING });
        
        // Update localStorage
        const stored = JSON.parse(localStorage.getItem(`booking_${bookingId}`));
        if (stored) {
          stored.status = 'confirmed';
          localStorage.setItem(`booking_${bookingId}`, JSON.stringify(stored));
        }
        
        return true;
      } catch (error) {
        dispatch({ 
          type: BookingActionTypes.SET_ERROR, 
          payload: 'Failed to confirm booking' 
        });
        throw error;
      } finally {
        dispatch({ type: BookingActionTypes.SET_LOADING, payload: false });
      }
    },

    cancelBooking: async (bookingId, reason) => {
      try {
        dispatch({ type: BookingActionTypes.SET_LOADING, payload: true });
        
        // Simulate cancellation API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ type: BookingActionTypes.CANCEL_BOOKING });
        
        // Update localStorage
        const stored = JSON.parse(localStorage.getItem(`booking_${bookingId}`));
        if (stored) {
          stored.status = 'cancelled';
          stored.cancellationReason = reason;
          localStorage.setItem(`booking_${bookingId}`, JSON.stringify(stored));
        }
        
        return true;
      } catch (error) {
        dispatch({ 
          type: BookingActionTypes.SET_ERROR, 
          payload: 'Failed to cancel booking' 
        });
        throw error;
      } finally {
        dispatch({ type: BookingActionTypes.SET_LOADING, payload: false });
      }
    },

    // Utility
    resetBooking: () => {
      dispatch({ type: BookingActionTypes.RESET_BOOKING });
    },

    loadBooking: (bookingData) => {
      dispatch({ type: BookingActionTypes.LOAD_BOOKING, payload: bookingData });
    },

    clearError: () => {
      dispatch({ type: BookingActionTypes.CLEAR_ERROR });
    }
  };

  // Check if current step is valid
  const isStepValid = (step) => {
    switch (step) {
      case 1: // Service Selection
        return !!state.serviceType;
      
      case 2: // Schedule
        return !!state.schedule.date && !!state.schedule.time;
      
      case 3: // Location
        return !!state.location.address;
      
      case 4: // Cleaner Selection
        return true; // Optional step
      
      case 5: // Extras
        return true; // Optional step
      
      case 6: // Review & Confirm
        return state.pricing.totalAmount > 0;
      
      default:
        return false;
    }
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date) => {
    const baseSlots = [
      '08:00', '09:00', '10:00', '11:00', 
      '12:00', '13:00', '14:00', '15:00', 
      '16:00', '17:00'
    ];
    
    // Simulate some slots being booked
    const bookedSlots = ['10:00', '14:00']; // Mock data
    
    return baseSlots.filter(slot => !bookedSlots.includes(slot));
  };

  // Get booking summary for confirmation
  const getBookingSummary = () => {
    return {
      service: state.serviceType,
      schedule: state.schedule,
      location: state.location,
      cleaner: state.selectedCleaner,
      extras: state.extras,
      pricing: state.pricing,
      status: state.status
    };
  };

  const value = {
    ...state,
    ...actions,
    isStepValid,
    getAvailableTimeSlots,
    getBookingSummary,
    canProceed: isStepValid(state.currentStep),
    isLastStep: state.currentStep === 6,
    isFirstStep: state.currentStep === 1
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;