import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentService from '../api/services/studentService';

/**
 * Hook to get current student's profile
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
