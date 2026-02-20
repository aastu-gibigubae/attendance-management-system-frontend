import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentService from '../api/services/studentService';

/**
 * Hook to get current student's profile (from /student/courses)
 * @returns {Object} Query object with profile data
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['student', 'profile', 'me'],
    queryFn: studentService.getMyProfile,
  });
};

/**
 * Hook to update current student's profile (year only)
 * @returns {Object} Mutation object
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentService.updateMyProfile,
    onSuccess: () => {
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', 'me'] });
      // Invalidate student courses query so course list reflects the new year
      queryClient.invalidateQueries({ queryKey: ['courses', 'student-courses'] });
    },
  });
};

/**
 * Hook to get the current student's full profile from /student/me
 * @returns {Object} Query object with full student data
 */
export const useMe = () => {
  return useQuery({
    queryKey: ['student', 'me'],
    queryFn: studentService.getMe,
  });
};

/**
 * Hook to update the current student's full profile via /student/update/me
 * @returns {Object} Mutation object
 */
export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentService.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'student-courses'] });
    },
  });
};
