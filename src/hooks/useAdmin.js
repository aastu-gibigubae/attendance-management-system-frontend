import { useMutation } from '@tanstack/react-query';
import adminService from '../api/services/adminService';

/**
 * Hook for admin-only student registration.
 * Uses the dedicated /admin/register_student endpoint which does NOT set
 * auth cookies — the admin's session is preserved after registration.
 *
 * @param {Object} options - Optional callbacks (onSuccess, onError)
 * @returns {Object} Mutation object with mutate, isPending, error, etc.
 */
export const useAdminRegisterStudent = (options = {}) => {
  return useMutation({
    mutationFn: (studentData) => adminService.registerStudent(studentData),
    ...options,
  });
};
