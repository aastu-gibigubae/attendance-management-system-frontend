import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import courseService from '../api/services/courseService';

// Query keys for course-related queries
export const courseKeys = {
  all: ['courses'],
  lists: () => [...courseKeys.all, 'list'],
  my: () => [...courseKeys.all, 'my'],
  studentCourses: () => [...courseKeys.all, 'student-courses'],
  eventCourses: () => [...courseKeys.all, 'event-courses'],
  detail: (id) => [...courseKeys.all, 'detail', id],
  students: (courseId) => [...courseKeys.all, 'students', courseId],
};

/**
 * Hook to get all courses (admin)
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: courseService.getAllCourses,
  });
};

/**
 * Hook to get student's enrolled courses
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useMyCourses = () => {
  return useQuery({
    queryKey: courseKeys.my(),
    queryFn: courseService.getMyCourses,
  });
};

/**
 * Hook to get all available courses for student (organized by semester)
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useStudentCourses = () => {
  return useQuery({
    queryKey: courseKeys.studentCourses(),
    queryFn: courseService.getStudentCourses,
  });
};

/**
 * Hook to get all event-type courses (visible to all students)
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useEventCourses = () => {
  return useQuery({
    queryKey: courseKeys.eventCourses(),
    queryFn: courseService.getEventCourses,
  });
};

/**
 * Hook to get a single course by ID
 * @param {string|number} id - Course ID
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useCourse = (id) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id, // Only fetch if ID is provided
  });
};

/**
 * Hook to get students enrolled in a course
 * @param {string|number} courseId - Course ID
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useCourseStudents = (courseId) => {
  return useQuery({
    queryKey: courseKeys.students(courseId),
    queryFn: () => courseService.getCourseStudents(courseId),
    enabled: !!courseId,
  });
};

/**
 * Hook to create a new course
 * @returns {Object} Mutation object
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

/**
 * Hook to update a course
 * @returns {Object} Mutation object
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => courseService.updateCourse(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific course and lists
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook to delete a course
 * @returns {Object} Mutation object
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};
