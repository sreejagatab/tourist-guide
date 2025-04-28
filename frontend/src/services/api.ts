import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF cookies
});

// Store CSRF token
let csrfToken: string | null = null;

// Function to get CSRF token
const fetchCsrfToken = async () => {
  if (!csrfToken) {
    try {
      const response = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
      csrfToken = response.data.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }
  return csrfToken;
};

// Add a request interceptor to add the auth token and CSRF token to requests
api.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      try {
        const token = await fetchCsrfToken();
        if (token) {
          config.headers['X-CSRF-Token'] = token;
        }
      } catch (error) {
        console.error('Error adding CSRF token to request:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 403 && error.response.data?.message?.includes('CSRF')) {
        // CSRF token validation failed, try to get a new token
        csrfToken = null;
        console.error('CSRF token validation failed. Will try to get a new token on next request.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
