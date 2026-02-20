import { useMutation, useQuery } from '@tanstack/react-query';
import authService from '../api/services/authService';

/**
 * useGetMe — checks if the user is already authenticated on app load.
 *
 * Calls GET /student/me. The browser automatically sends the auth_token
 * HttpOnly cookie with this request — no manual token handling needed.
 *
 * If auth_token is expired, the apiClient interceptor will silently call
 * POST /refresh-token and retry. So this hook only errors when the session
 * is truly over (both tokens expired / user never logged in).
 *
 * Response shape: { success: true, data: { id, role, first_name, email, ... } }
 * → role is at data.data.role
 */
export const useGetMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    retry: false,        // Don't retry — the apiClient interceptor already handles token refresh
    staleTime: Infinity, // Don't re-fetch automatically while the app is open
  });
};

/**
 * Hook for user login
 * @param {Object} options - Optional callbacks (onSuccess, onError)
 * @returns {Object} Mutation object with mutate, isPending, error, etc.
 */
export const useLogin = (options = {}) => {
  return useMutation({
    mutationFn: ({ email, password }) => authService.signIn(email, password),
    ...options,
  });
};

/**
 * Hook for user signup
 * @param {Object} options - Optional callbacks (onSuccess, onError)
 * @returns {Object} Mutation object with mutate, isPending, error, etc.
 */
export const useSignup = (options = {}) => {
  return useMutation({
    mutationFn: (userData) => authService.signUp(userData),
    ...options,
  });
};

/**
 * Hook for user logout
 * @param {Object} options - Optional callbacks (onSuccess, onError)
 * @returns {Object} Mutation object with mutate, isPending, error, etc.
 */
export const useLogout = (options = {}) => {
  return useMutation({
    mutationFn: () => authService.logout(),
    ...options,
  });
};
