import apiClient from "../apiClient";

/**
 * Admin Service
 * Handles admin-only API operations that should not affect the admin's auth session.
 */

export const adminService = {
  /**
   * Register a new student as an admin.
   * Unlike /sign-up, this endpoint does NOT set any auth cookies,
   * so the admin's session remains intact.
   *
   * Endpoint: POST /admin/register_student
   * @param {FormData} studentData - Student registration form data
   * @returns {Promise} Response with the created student data
   */
  registerStudent: async (studentData) => {
    const config =
      studentData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const response = await apiClient.post(
      "/admin/register_student",
      studentData,
      config,
    );
    return response.data;
  },
};

export default adminService;
