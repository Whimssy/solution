// Centralized API configuration
// This file manages all API base URL configuration and provides helper functions

// Get API base URL from environment variable
// Defaults to http://localhost:5000/api if not set
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Request timeout configuration (in milliseconds)
const REQUEST_TIMEOUT = 10000; // 10 seconds

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
      throw new Error('Request timeout - Please check your internet connection');
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
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
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
};

export default {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  fetchWithTimeout,
  getToken,
  getAuthHeaders,
  apiRequest,
  handleResponse,
};


