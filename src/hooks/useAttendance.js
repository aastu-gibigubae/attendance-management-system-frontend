import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceService from '../api/services/attendanceService';

// Query keys for attendance-related queries
export const attendanceKeys = {
  all: ['attendance'],
  byCourse: (courseId) => [...attendanceKeys.all, 'course', courseId],
  studentByCourse: (courseId) => [...attendanceKeys.all, 'student', 'course', courseId],
};

/**
 * Hook to get course attendance records (admin view)
 * @param {string|number} courseId - Course ID
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useCourseAttendance = (courseId) => {
  return useQuery({
    queryKey: attendanceKeys.byCourse(courseId),
    queryFn: () => attendanceService.getCourseAttendance(courseId),
    enabled: !!courseId,
  });
};

/**
 * Hook to get student's attendance records for a course
 * @param {string|number} courseId - Course ID
 * @returns {Object} Query object with data, isLoading, error, etc.
 */
export const useStudentAttendance = (courseId) => {
  return useQuery({
    queryKey: attendanceKeys.studentByCourse(courseId),
    queryFn: () => attendanceService.getStudentAttendance(courseId),
    enabled: !!courseId,
  });
};

/**
 * Hook to create a new attendance session
 * @returns {Object} Mutation object
 */
export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceService.createAttendance,
    onSuccess: (_, variables) => {
      console.log('🎯 Attendance created! CourseId:', variables.courseId);
      console.log('🔄 Invalidating admin query:', attendanceKeys.byCourse(variables.courseId));
      console.log('🔄 Invalidating student query:', attendanceKeys.studentByCourse(variables.courseId));
      
      // Invalidate and refetch admin's attendance view for the course
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.byCourse(variables.courseId),
        refetchType: 'active' // Refetch active queries immediately
      });
      
      // Invalidate and refetch student's attendance view for the course
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.studentByCourse(variables.courseId),
        refetchType: 'active' // Refetch active queries immediately
      });
      
      console.log('✅ Both queries invalidated with active refetch!');
    },
  });
};

/**
 * Hook for admin to mark attendance with optimistic updates
 * @returns {Object} Mutation object
 */
export const useMarkAttendanceAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceService.markAttendanceAdmin,
    
    // Optimistic update: Update the cache immediately before the mutation
    onMutate: async (variables) => {
      const { studentId, attendanceId, present } = variables;
      
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: attendanceKeys.all });
      
      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: attendanceKeys.all });
      
      // Optimistically update all matching queries
      queryClient.setQueriesData({ queryKey: attendanceKeys.all }, (old) => {
        if (!old?.success || !old?.data) return old;
        
        // Update the attendance data
        const updatedData = old.data.map((session) => {
          if (session.id === attendanceId) {
            return {
              ...session,
              students: session.students.map((student) => {
                if (student.id === studentId) {
                  return {
                    ...student,
                    StudentAttendance: {
                      ...student.StudentAttendance,
                      present: present,
                    },
                  };
                }
                return student;
              }),
            };
          }
          return session;
        });
        
        return { ...old, data: updatedData };
      });
      
      // Return context with previous data for rollback
      return { previousData };
    },
    
    // On error, rollback to previous data
    onError: (err, variables, context) => {
      if (context?.previousData) {
        // Restore all previous queries
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("Failed to mark attendance", err);
    },
    
    // Always refetch after error or success to ensure cache is in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
};

/**
 * Hook for student to mark their own attendance
 * @returns {Object} Mutation object
 */
export const useMarkAttendanceStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceService.markAttendanceStudent,
    onSuccess: () => {
      // Invalidate student attendance queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
};
