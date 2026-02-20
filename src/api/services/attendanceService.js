import apiClient from '../apiClient';

/**
 * Attendance Service
 * Handles attendance creation, retrieval, and marking operations
 */

export const attendanceService = {
  /**
   * Create a new attendance session
   * @param {Object} attendanceData - Attendance session data (courseId, date, etc.)
   * @returns {Promise} Response with created attendance session
   */
  createAttendance: async (attendanceData) => {
    const response = await apiClient.post('/attendance/', attendanceData);
    return response.data;
  },

  /**
   * Get course attendance records (admin view)
   * @param {string|number} courseId - Course ID
   * @returns {Promise} Response with attendance records
   */
  getCourseAttendance: async (courseId) => {
    const response = await apiClient.get(`/attendance/course/${courseId}`);
    return response.data;
  },

  /**
   * Get student's attendance records for a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise} Response with student's attendance records
   */
  getStudentAttendance: async (courseId) => {
    const response = await apiClient.get(`/attendance/student/course/${courseId}`);
    return response.data;
  },

  /**
   * Mark attendance as admin
   * @param {Object} attendanceData - { attendanceId, studentId, present }
   * @returns {Promise} Response confirming attendance marked
   */
  markAttendanceAdmin: async (attendanceData) => {
    const response = await apiClient.post('/attendance/mark/admin', attendanceData);
    return response.data;
  },

  /**
   * Mark attendance as student (with code)
   * @param {Object} attendanceData - { attendanceId, code }
   * @returns {Promise} Response confirming attendance marked
   */
  markAttendanceStudent: async (attendanceData) => {
    const response = await apiClient.post('/attendance/mark/student', attendanceData);
    return response.data;
  },

  /**
   * Delete an attendance session
   * @param {string|number} attendanceId - Attendance ID to delete
   * @returns {Promise} Response confirming deletion
   */
  deleteAttendance: async (attendanceId) => {
    const response = await apiClient.delete(`/attendance/${attendanceId}`);
    return response.data;
  },
};

export default attendanceService;
