/**
 * =========================================================================================
 * NAVIGATION UTILITY & ROLE ROUTE RESOLVER
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): Dynamic Route Canonical Paths
 *   - 24INMCAT307 (Software Engineering): Role-Based Access Control (RBAC) Dispatcher
 * 
 * Function Purpose:
 *   Evaluates authenticated user role and dynamically derives their home URL path,
 *   incorporating their domain-specific primary key (e.g. /teacher/1, /student/2, /parent/3).
 * =========================================================================================
 */

export const getUserHomePath = (user) => {
  if (!user) return '/login';
  switch (user.role) {
    case 'teacher':
      return `/teacher/${user.teacher_id || user.id}`;
    case 'student':
      return `/student/${user.student_id || user.id}`;
    case 'parent':
      return `/parent/${user.parent_id || user.id}`;
    case 'admin':
    default:
      return '/admin';
  }
};
