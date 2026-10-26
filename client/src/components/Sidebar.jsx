/**
 * =========================================================================================
 * SIDEBAR NAVIGATION COMPONENT (Sidebar.jsx)
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): Role-Tailored Navigation Menus, NavLink Active States, Lucide Icons
 *   - 24INMCAT307 (Software Engineering): Role-Based UI Presentation Partitioning
 * 
 * Key UI/UX Highlights:
 *   1. Dynamic Menu Filtering: Renders tailored navigation link clusters strictly matching
 *      the active user role (adminLinks, teacherLinks, studentLinks, parentLinks).
 *   2. React Router DOM NavLink: Automatically applies active CSS styles (bg-blue-50, text-blue-700)
 *      to indicate current route context without requiring manual page state tracking.
 *   3. Vector Iconography: Employs Lucide React icons for high scannability.
 * =========================================================================================
 */

import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Award,
  DollarSign,
  Megaphone,
  Clock,
  HeartHandshake
} from 'lucide-react';

const Sidebar = () => {
  // Read authenticated user state to determine menu links
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const role = user.role;

  // Domain ID extraction for dynamic parameterized links
  const teacherId = user.teacher_id || user.id;
  const studentId = user.student_id || user.id;
  const parentId = user.parent_id || user.id;

  // 1. Administrator Navigation Menu
  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/teachers', label: 'Teachers', icon: UserCheck },
    { to: '/admin/parents', label: 'Parents', icon: HeartHandshake },
    { to: '/admin/classes', label: 'Classes & Subjects', icon: BookOpen },
    { to: '/admin/fees', label: 'Fee Records', icon: DollarSign },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  ];

  // 2. Teacher Navigation Menu
  const teacherLinks = [
    { to: `/teacher/${teacherId}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `/teacher/${teacherId}/attendance`, label: 'Mark Attendance', icon: CalendarCheck },
    { to: `/teacher/${teacherId}/marks`, label: 'Input Marks & Remarks', icon: Award },
  ];

  // 3. Student Navigation Menu
  const studentLinks = [
    { to: `/student/${studentId}`, label: 'My Dashboard', icon: LayoutDashboard, end: true },
  ];

  // 4. Parent Navigation Menu
  const parentLinks = [
    { to: `/parent/${parentId}`, label: 'Child Dashboard', icon: LayoutDashboard, end: true },
  ];

  // Role-based menu assignment
  let navLinks = [];
  if (role === 'admin') navLinks = adminLinks;
  else if (role === 'teacher') navLinks = teacherLinks;
  else if (role === 'student') navLinks = studentLinks;
  else if (role === 'parent') navLinks = parentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Navigation
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 text-gray-500" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600">
        <p className="font-semibold text-gray-800">Support & Info</p>
        <p className="mt-0.5">Need help? Contact system admin at <span className="font-mono text-blue-600">admin@school.edu</span></p>
      </div>
    </aside>
  );
};

export default Sidebar;
