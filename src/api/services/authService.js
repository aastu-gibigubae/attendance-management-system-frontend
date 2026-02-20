import apiClient from '../apiClient';

/**
 * Authentication Service
 * Handles user sign-in, sign-up, logout, token management, and session verification.
 */

export const authService = {
  /**
   * Verify the current session by fetching the logged-in user's profile.
   * Uses the `auth_token` HttpOnly cookie sent automatically by the browser.
   * Works for both students and admins (all users share the Student table).
   *
   * Endpoint: GET /student/me
   * Response:  { success: true, data: { id, role, first_name, email, ... } }
   *
   * @returns {Promise} Response with full user profile including role
   */
  getMe: async () => {
    const response = await apiClient.get('/student/me');
    return response.data;
  },

  /**
   * Use the long-lived refresh_token cookie to get a new auth_token cookie.
   * Called automatically by the apiClient interceptor on 401 errors.
   *
   * Endpoint: POST /refresh-token
   * @returns {Promise} { success: true, message: "Token refreshed" }
   */
  refreshToken: async () => {
    const response = await apiClient.post('/refresh-token');
    return response.data;
  },

  /**
   * Sign in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with user data and role
   */
  signIn: async (email, password) => {
    const response = await apiClient.post('/sign-in', { email, password });
    return response.data;
  },

  /**
   * Sign up a new user
   * @param {Object|FormData} userData - User registration data
   * @returns {Promise} Response with created user data
   */
  signUp: async (userData) => {
    const config = userData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await apiClient.post('/sign-up', userData, config);
    return response.data;
  },

  /**
   * Log out the current user — clears both HttpOnly cookies on the server
   * @returns {Promise} Response from logout endpoint
   */
  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};

export default authService;
