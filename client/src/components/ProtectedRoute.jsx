/**
 * =========================================================================================
 * PROTECTED ROUTE GUARD COMPONENT
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): Declarative Route Protection & Navigation Guards
 *   - 24INMCAT307 (Software Engineering): Role-Based Access Control (RBAC) Enforcement
 * 
 * Mechanics:
 *   1. Extracts global 'user' state via React's useContext(AuthContext).
 *   2. If unauthenticated (!user), halts navigation and redirects to '/login'.
 *   3. If authenticated but role not in 'allowedRoles', redirects to their assigned role dashboard.
 *   4. If authorized, renders child routes via the React Router DOM <Outlet /> primitive.
 * =========================================================================================
 */

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserHomePath } from '../utils/navigation';

const ProtectedRoute = ({ allowedRoles }) => {
  // Access global authentication session via useContext hook (eliminating prop drilling)
  const { user } = useContext(AuthContext);

  // Condition 1: User is not authenticated -> redirect to login view
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Condition 2: User is authenticated but lacks required role permission -> redirect to role home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getUserHomePath(user)} replace />;
  }

  // Condition 3: Authorized -> render nested child routes using Outlet primitive
  return <Outlet />;
};

export default ProtectedRoute;
