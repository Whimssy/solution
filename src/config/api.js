// Centralized API configuration
// This file manages all API base URL configuration and provides helper functions

// Get API base URL from environment variable
// Defaults to http://localhost:5000/api if not set
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Request timeout configuration (in milliseconds)
// Increased for MongoDB Atlas (cloud) network latency
const REQUEST_TIMEOUT = 30000; // 30 seconds for Atlas connections

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, status, errorType, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errorType = errorType;
    this.details = details;
  }
}

/**
 * Helper function for fetch with timeout
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      // Check if it's a network issue or server issue
      throw new APIError(
        'Request timeout - The server is taking too long to respond. This may indicate a database connection issue.',
        'TIMEOUT',
        'NETWORK_ERROR',
        { originalError: 'AbortError' }
      );
    }
    // Network errors (ECONNREFUSED, ENOTFOUND, etc.)
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      throw new APIError(
        'Cannot connect to server. Please check if the backend server is running.',
        'NETWORK_ERROR',
        'NETWORK_ERROR',
        { originalError: error.message }
      );
    }
    throw error;
  }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} - JWT token or null
 */
const getToken = () => {
  // Check for token in different possible storage keys
  return localStorage.getItem('token') || 
         localStorage.getItem('cleanify_token') || 
         null;
};

/**
 * Get authentication headers with token
 * @param {object} additionalHeaders - Additional headers to include
 * @returns {object} - Headers object with Authorization if token exists
 */
const getAuthHeaders = (additionalHeaders = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = getAuthHeaders(options.headers);
  
  const response = await fetchWithTimeout(url, {
    ...options,
    headers,
  });
  
  return response;
};

/**
 * Handle API response and parse JSON
 * @param {Response} response - Fetch response
 * @returns {Promise<object>} - Parsed JSON data
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle non-JSON responses
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    let errorMessage = `Request failed with status ${response.status}`;
    
    // Provide specific messages for common status codes
    if (response.status === 503) {
      errorMessage = 'Service unavailable - Database connection issue. Please check if MongoDB is running.';
    } else if (response.status === 500) {
      errorMessage = 'Server error - Please try again later.';
    } else if (response.status === 404) {
      errorMessage = 'Endpoint not found.';
    }
    
    throw new APIError(
      text || errorMessage,
      response.status,
      'SERVER_ERROR',
      { contentType, text }
    );
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    // Check for database connection errors
    if (response.status === 503 && data.error === 'DATABASE_CONNECTION_ERROR') {
      throw new APIError(
        data.message || 'Database connection unavailable. Please check if MongoDB is running and try again.',
        response.status,
        'DATABASE_ERROR',
        data.details || {}
      );
    }
    
    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new APIError(
        data.message || 'Authentication failed. Please check your credentials.',
        response.status,
        'AUTH_ERROR',
        {}
      );
    }
    
    // Check for validation errors
    if (response.status === 400) {
      throw new APIError(
        data.message || 'Invalid request. Please check your input.',
        response.status,
        'VALIDATION_ERROR',
        data.errors || {}
      );
    }
    
    // Generic server errors
    throw new APIError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
      'SERVER_ERROR',
      data
    );
  }
  
  return data;
};

// Export API configuration and utilities
export {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  fetchWithTimeout,
  getToken,
  getAuthHeaders,
  apiRequest,
  handleResponse,
  APIError,
};

export default {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  fetchWithTimeout,
  getToken,
  getAuthHeaders,
  apiRequest,
  handleResponse,
  APIError,
};


