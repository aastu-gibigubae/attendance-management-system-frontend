import apiClient from '../apiClient';

/**
 * Course Service
 * Handles all course-related API operations
 */

export const courseService = {
  /**
   * Get all courses (admin)
   * @returns {Promise} Response with all courses
   */
  getAllCourses: async () => {
    const response = await apiClient.get('/course');
    return response.data;
  },

  /**
   * Get my enrolled courses (student)
   * @returns {Promise} Response with student's courses
   */
  getMyCourses: async () => {
    const response = await apiClient.get('/course/my');
    return response.data;
  },

  /**
   * Get all available courses for student (organized by semester with enrollment status)
   * @returns {Promise} Response with student info and courses grouped by semester
   */
  getStudentCourses: async () => {
    const response = await apiClient.get('/student/courses');
    return response.data;
  },

  /**
   * Get course by ID
   * @param {string|number} id - Course ID
   * @returns {Promise} Response with course details
   */
  getCourseById: async (id) => {
    const response = await apiClient.get(`/course/${id}`);
    return response.data;
  },

  /**
   * Create a new course
   * @param {Object} courseData - Course data (name, description, dates, etc.)
   * @returns {Promise} Response with created course
   */
  createCourse: async (courseData) => {
    const response = await apiClient.post('/course', courseData);
    return response.data;
  },

  /**
   * Update a course
   * @param {string|number} id - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise} Response with updated course
   */
  updateCourse: async (id, courseData) => {
    const response = await apiClient.put(`/course/${id}`, courseData);
    return response.data;
  },

  /**
   * Delete a course
   * @param {string|number} id - Course ID
   * @returns {Promise} Response confirming deletion
   */
  deleteCourse: async (id) => {
    const response = await apiClient.delete(`/course/${id}`);
    return response.data;
  },

  /**
   * Get all event-type courses (visible to all students)
   * @returns {Promise} Response with event courses
   */
  getEventCourses: async () => {
    const response = await apiClient.get('/course?type=event');
    return response.data;
  },

  /**
   * Get students enrolled in a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise} Response with enrolled students
   */
  getCourseStudents: async (courseId) => {
    const response = await apiClient.get(`/course/students/${courseId}`);
    return response.data;
  },
};

export default courseService;
