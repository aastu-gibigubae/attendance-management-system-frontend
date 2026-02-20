import apiClient from '../apiClient';

/**
 * Student Service
 * Handles all student-related API operations
 */

export const studentService = {
  /**
   * Get all students
   * @returns {Promise} Response with all students
   */
  getAllStudents: async () => {
    const response = await apiClient.get('/student/all');
    return response.data;
  },

  /**
   * Search students by term
   * @param {string} term - Search term (name, ID, etc.)
   * @returns {Promise} Response with matching students
   */
  searchStudents: async (term) => {
    const response = await apiClient.get(`/student/search/${term}`);
    return response.data;
  },

  /**
   * Update student information (admin)
   * @param {string|number} id - Student ID
   * @param {Object} studentData - Updated student data (year, department)
   * @returns {Promise} Response with updated student
   */
  updateStudent: async (id, studentData) => {
    const response = await apiClient.put(`/student/admin/update/${id}`, studentData);
    return response.data;
  },

  /**
   * Delete a student (admin)
   * @param {string|number} id - Student ID
   * @returns {Promise} Response confirming deletion
   */
  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/student/admin/delete/${id}`);
    return response.data;
  },

  /**
   * Get current student's profile (self)
   * Uses the /student/courses endpoint which returns student data along with courses
   * @returns {Promise} Response with current student's data
   */
  getMyProfile: async () => {
    const response = await apiClient.get('/student/courses');
    return response.data;
  },

  /**
   * Update current student's profile (self-update year only)
   * @param {Object} data - { year: number }
   * @returns {Promise} Response with updated student
   */
  updateMyProfile: async (data) => {
    const response = await apiClient.put('/student/update/me', data);
    return response.data;
  },

  /**
   * Get current student's full profile from /student/me
   * @returns {Promise} Response with full student data
   */
  getMe: async () => {
    const response = await apiClient.get('/student/me');
    return response.data;
  },

  /**
   * Update current student's full profile
   * @param {Object} data - Updated student fields
   * @returns {Promise} Response with updated student
   */
  updateMe: async (data) => {
    const response = await apiClient.put('/student/update/me', data);
    return response.data;
  },

};

export default studentService;
