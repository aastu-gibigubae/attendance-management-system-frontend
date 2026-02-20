import axios from 'axios';

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true, // Always send cookies (auth_token, refresh_token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response interceptor — auto token refresh on 401 ────────────────────────
//
// How it works (same as GitHub, Google, etc.):
//
//   1. Every request goes out normally.
//   2. If the server returns 401 (auth_token expired), we silently call
//      POST /refresh-token. The browser sends the refresh_token cookie automatically.
//   3. If the refresh succeeds, the server sets a new auth_token cookie and we
//      retry the original request — the user never sees an error.
//   4. If the refresh also fails (refresh_token expired), we redirect to login.
//
// We use a flag (_retry) on the config object to prevent infinite retry loops.

let isRefreshing = false;
let failedQueue = [];

// Drain the queue of requests that were waiting for the refresh to complete
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 errors, and only once per request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Don't try to refresh if the failing request IS the refresh endpoint itself
      !originalRequest.url?.includes('/refresh-token') &&
      // Don't try to refresh for login/signup requests
      !originalRequest.url?.includes('/sign-in') &&
      !originalRequest.url?.includes('/sign-up')
    ) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Ask the server to refresh the auth_token using the refresh_token cookie
        await apiClient.post('/refresh-token');

        // Refresh succeeded — retry all queued requests and the original one
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — the AuthProvider will see isError and redirect to login
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, log and reject
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Request failed:', data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Network error — no response received');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
