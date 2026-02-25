import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import enrollmentService from '../api/services/enrollmentService';
import { courseKeys } from './useCourses';

// Query keys for enrollment-related queries
export const enrollmentKeys = {
  all: ['enrollments'],
  byCourse: (courseId) => [...enrollmentKeys.all, 'course', courseId],
};

/**
 * Hook to get enrolled students for a course
 * @param {string|number} courseId - Course ID
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useEnrolledStudents = (courseId) => {
  return useQuery({
    queryKey: enrollmentKeys.byCourse(courseId),
    queryFn: () => enrollmentService.getEnrolledStudents(courseId),
    enabled: !!courseId,
  });
};

/**
 * Hook to enroll a student in a course
 * @returns {Object} Mutation object
 */
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.enrollStudent,
    onSuccess: (_, variables) => {
      // Invalidate enrolled students for the course
      queryClient.invalidateQueries({ 
        queryKey: enrollmentKeys.byCourse(variables.courseId) 
      });
      // Invalidate course students count/list
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.students(variables.courseId) 
      });
      // Also invalidate my courses if student enrolled themselves
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
    },
  });
};

/**
 * Hook to unenroll a student from a course
 * @returns {Object} Mutation object
 */
export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.unenrollStudent,
    onSuccess: (_, variables) => {
      // Invalidate enrolled students for the course
      queryClient.invalidateQueries({ 
        queryKey: enrollmentKeys.byCourse(variables.courseId) 
      });
      // Invalidate course students count/list
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.students(variables.courseId) 
      });
      // Also invalidate my courses if student unenrolled themselves
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
    },
  });
};

/**
 * Hook for student self-enrollment
 * @returns {Object} Mutation object
 */
export const useSelfEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.selfEnroll,
    onSuccess: () => {
      // Invalidate all three course queries so enrollment status updates everywhere
      queryClient.invalidateQueries({ queryKey: courseKeys.studentCourses() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
      queryClient.invalidateQueries({ queryKey: courseKeys.eventCourses() });
    },
  });
};
