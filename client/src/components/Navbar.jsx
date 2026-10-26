/**
 * =========================================================================================
 * NAVIGATION BAR COMPONENT (Navbar.jsx)
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): Semantic Color Tokens, Sticky Layout & Responsive Navigation
 *   - 24INMCAT307 (Software Engineering): User Session Presentation & Role Badging
 * 
 * Key UI/UX Highlights:
 *   1. Sticky Header: Fixed at top of viewport (sticky top-0 z-30) for uninterrupted access.
 *   2. Semantic Role Badges: getRoleBadge assigns high-contrast pill badges (Purple for Admin,
 *      Blue for Teacher, Emerald for Student, Amber for Parent).
 *   3. User Identity Display: Shows user full name and system login ID.
 *   4. Logout Action: Directly triggers AuthContext.logout() to invalidate token and session.
 * =========================================================================================
 */

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, GraduationCap, User } from 'lucide-react';

const Navbar = () => {
  // Consume user profile and logout function from global AuthContext
  const { user, logout } = useContext(AuthContext);

  // Semantic UI Badge Generator according to user role
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-medium">Admin Portal</span>;
      case 'teacher':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">Teacher Portal</span>;
      case 'student':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">Student Portal</span>;
      case 'parent':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">Parent Portal</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Portal Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Student Management System</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Academic & Administrative Portal</p>
          </div>
        </div>

        {/* Authenticated User Session Info & Logout Button */}
        {user && (
          <div className="flex items-center gap-4">
            {getRoleBadge(user.role)}
            <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm border">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500 font-mono">ID: {user.login_id}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md font-medium transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
