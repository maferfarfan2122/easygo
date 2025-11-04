/**
 * API Service - Centralized API calls with request management
 * Handles concurrent requests, request cancellation, retries, and rate limiting
 * Includes token system integration
 */

import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Request queue and controllers for cancellation
const requestQueue = new Map();
const abortControllers = new Map();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 1000, // 1 second
  queue: [],
  timestamps: []
};

// Token tracking
let userTokens = null;

/**
 * Get current user ID from Supabase
 */
const getUserId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user?.id || 'anonymous';
  } catch (error) {
    console.warn('Failed to get user ID:', error);
    return 'anonymous';
  }
};

/**
 * Get user's token balance
 */
export const getUserTokenBalance = async () => {
  try {
    const userId = await getUserId();
    const response = await fetch(`${API_URL}/api/user/tokens`, {
      method: 'GET',
      headers: {
        'X-User-ID': userId
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get token balance: ${response.status}`);
    }
    
    const data = await response.json();
    userTokens = data.tokens_remaining;
    return data;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return null;
  }
};

/**
 * Update local token count from response headers
 */
const updateTokensFromResponse = (response) => {
  const tokensRemaining = response.headers.get('X-Tokens-Remaining');
  if (tokensRemaining) {
    userTokens = parseInt(tokensRemaining, 10);
  }
};

/**
 * Rate limiter - prevents too many requests in a short time
 */
const checkRateLimit = () => {
  const now = Date.now();
  RATE_LIMIT.timestamps = RATE_LIMIT.timestamps.filter(
    timestamp => now - timestamp < RATE_LIMIT.windowMs
  );
  
  return RATE_LIMIT.timestamps.length < RATE_LIMIT.maxRequests;
};

const addToRateLimit = () => {
  RATE_LIMIT.timestamps.push(Date.now());
};

/**
 * Create a unique key for request identification
 */
const createRequestKey = (endpoint, method, body) => {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${method}-${endpoint}-${bodyStr}`;
};

/**
 * Cancel a pending request
 */
export const cancelRequest = (requestKey) => {
  const controller = abortControllers.get(requestKey);
  if (controller) {
    controller.abort();
    abortControllers.delete(requestKey);
    requestQueue.delete(requestKey);
  }
};

/**
 * Cancel all pending requests
 */
export const cancelAllRequests = () => {
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
  requestQueue.clear();
};

/**
 * Debounced fetch - prevents duplicate concurrent requests
 * Now includes X-User-ID header for token system
 */
const debouncedFetch = async (endpoint, options = {}, requestKey) => {
  // Cancel previous identical request if exists
  if (requestQueue.has(requestKey)) {
    cancelRequest(requestKey);
  }

  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please wait a moment.');
  }

  // Get user ID for token system
  const userId = await getUserId();

  // Create abort controller for this request
  const controller = new AbortController();
  abortControllers.set(requestKey, controller);

  // Create promise for this request
  const requestPromise = fetch(`${API_URL}${endpoint}`, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
      ...options.headers
    }
  });

  requestQueue.set(requestKey, requestPromise);
  addToRateLimit();

  try {
    const response = await requestPromise;
    
    // Update tokens from response
    updateTokensFromResponse(response);
    
    // Clean up
    abortControllers.delete(requestKey);
    requestQueue.delete(requestKey);

    return response;
  } catch (error) {
    // Clean up
    abortControllers.delete(requestKey);
    requestQueue.delete(requestKey);

    // Don't throw error if request was cancelled
    if (error.name === 'AbortError') {
      console.log('Request cancelled:', requestKey);
      return null;
    }

    throw error;
  }
};

/**
 * Retry logic for failed requests
 */
const retryFetch = async (endpoint, options, maxRetries = 2) => {
  const requestKey = createRequestKey(endpoint, options.method || 'GET', options.body);
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await debouncedFetch(endpoint, options, requestKey);
      
      if (!response) {
        // Request was cancelled
        return null;
      }

      if (response.ok) {
        return response;
      }

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on server errors (5xx)
      if (i < maxRetries) {
        console.log(`Retrying request (${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }

      return response;
    } catch (error) {
      if (i === maxRetries) {
        throw error;
      }
      console.log(`Retrying after error (${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

/**
 * GET request
 */
export const apiGet = async (endpoint, options = {}) => {
  try {
    const response = await retryFetch(endpoint, {
      method: 'GET',
      ...options
    });

    if (!response) return null; // Request cancelled

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
};

/**
 * POST request
 */
export const apiPost = async (endpoint, data, options = {}) => {
  try {
    const response = await retryFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });

    if (!response) return null; // Request cancelled

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Check if response is JSON or blob (PDF)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('application/pdf')) {
      return await response.blob();
    }

    return await response.json();
  } catch (error) {
    console.error('API POST Error:', error);
    throw error;
  }
};

/**
 * PUT request
 */
export const apiPut = async (endpoint, data, options = {}) => {
  try {
    const response = await retryFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });

    if (!response) return null; // Request cancelled

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API PUT Error:', error);
    throw error;
  }
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint, options = {}) => {
  try {
    const response = await retryFetch(endpoint, {
      method: 'DELETE',
      ...options
    });

    if (!response) return null; // Request cancelled

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API DELETE Error:', error);
    throw error;
  }
};

/**
 * Download file (PDF, etc.)
 */
export const apiDownload = async (endpoint, data, filename) => {
  try {
    const blob = await apiPost(endpoint, data);
    
    if (!blob) return; // Request cancelled

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('API Download Error:', error);
    throw error;
  }
};

/**
 * Get request status
 */
export const getActiveRequests = () => {
  return Array.from(requestQueue.keys());
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  download: apiDownload,
  cancelRequest,
  cancelAllRequests,
  getActiveRequests
};
