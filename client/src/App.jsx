/**
 * =========================================================================================
 * CAMPUSCONNECT: STUDENT MANAGEMENT SYSTEM (SMS)
 * =========================================================================================
 * Laboratory Courses Reference:
 *   - 24INMCAL393: User Interface and Design Lab (React 18, React Router v6, Tailwind CSS)
 *   - 24INMCAT307: Software Engineering (Role-Based Access Control, 3-Tier Client Architecture)
 * 
 * Key Architectural Highlights Demonstrated:
 *   1. Single-Page Application (SPA) routing with React Router DOM v6
 *   2. Declarative Route Protection & Role-Based Access Control (RBAC) via <ProtectedRoute>
 *   3. Dynamic Parameterized Routing (:teacherId, :classId, :subjectId)
 *   4. Persistent Layout Shell (<Layout /> wrapping Navbar and Sidebar with <Outlet />)
 *   5. Global Session Consumption via useContext(AuthContext)
 * =========================================================================================
 */

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageParents from './pages/admin/ManageParents';
import ManageClasses from './pages/admin/ManageClasses';
import ManageFees from './pages/admin/ManageFees';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import InputMarks from './pages/teacher/InputMarks';

import StudentDashboard from './pages/student/StudentDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';

import StudentDetails from './pages/admin/StudentDetails';
import TeacherDetails from './pages/admin/TeacherDetails';
import ClassDetails from './pages/admin/ClassDetails';
import SubjectDetails from './pages/student/SubjectDetails';
import { getUserHomePath } from './utils/navigation';

/**
 * UI Layout Shell Component (24INMCAL393 - UI Design Lab)
 * Provides a persistent responsive shell containing the sticky Navbar, collapsible Sidebar,
 * and adaptive main viewport (max-w-7xl mx-auto) avoiding redundant re-renders.
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  // useContext Hook: Consuming global user session from AuthContext without prop drilling
  const { user } = useContext(AuthContext);

  // Derive active domain identifiers for deep-linked dynamic paths
  const teacherId = user?.teacher_id || user?.id;
  const studentId = user?.student_id || user?.id;
  const parentId = user?.parent_id || user?.id;

  return (
    // React Router DOM v6 Declarative Routes Container
    <Routes>
      {/* Public Authentication Route: Redirects to home if already authenticated */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getUserHomePath(user)} replace />} />

      {/* =========================================================================
          ADMIN PORTAL ROUTES (Role-Based Route Guard: allowedRoles=['admin'])
          ========================================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/students" element={<Layout><ManageStudents /></Layout>} />
        <Route path="/admin/students/:id" element={<Layout><StudentDetails /></Layout>} />
        <Route path="/admin/teachers" element={<Layout><ManageTeachers /></Layout>} />
        <Route path="/admin/teachers/:id" element={<Layout><TeacherDetails /></Layout>} />
        <Route path="/admin/parents" element={<Layout><ManageParents /></Layout>} />
        <Route path="/admin/classes" element={<Layout><ManageClasses /></Layout>} />
        <Route path="/admin/classes/:classId" element={<Layout><ClassDetails /></Layout>} />
        <Route path="/admin/fees" element={<Layout><ManageFees /></Layout>} />
        <Route path="/admin/announcements" element={<Layout><ManageAnnouncements /></Layout>} />
      </Route>

      {/* =========================================================================
          TEACHER PORTAL ROUTES (Dynamic Parameterized Paths: /teacher/:teacherId/...)
          ========================================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        {/* Automatic canonical redirect to include the teacher's dynamic ID */}
        <Route path="/teacher" element={<Navigate to={`/teacher/${teacherId || ''}`} replace />} />
        <Route path="/teacher/:teacherId" element={<Layout><TeacherDashboard /></Layout>} />
        
        {/* Dynamic Attendance Tracking Routes */}
        <Route path="/teacher/attendance" element={<Navigate to={`/teacher/${teacherId || ''}/attendance`} replace />} />
        <Route path="/teacher/:teacherId/attendance" element={<Layout><MarkAttendance /></Layout>} />
        <Route path="/teacher/:teacherId/attendance/:classId" element={<Layout><MarkAttendance /></Layout>} />

        {/* Dynamic Gradebook & Examination Marks Routes */}
        <Route path="/teacher/marks" element={<Navigate to={`/teacher/${teacherId || ''}/marks`} replace />} />
        <Route path="/teacher/:teacherId/marks" element={<Layout><InputMarks /></Layout>} />
        <Route path="/teacher/:teacherId/marks/:classId" element={<Layout><InputMarks /></Layout>} />
        <Route path="/teacher/:teacherId/marks/:classId/:subjectId" element={<Layout><InputMarks /></Layout>} />
      </Route>

      {/* =========================================================================
          STUDENT PORTAL ROUTES (Role-Based Route Guard: allowedRoles=['student'])
          ========================================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<Navigate to={`/student/${studentId || ''}`} replace />} />
        <Route path="/student/:studentId" element={<Layout><StudentDashboard /></Layout>} />
        <Route path="/student/:studentId/subjects/:subjectId" element={<Layout><SubjectDetails /></Layout>} />
        <Route path="/student/subjects/:subjectId" element={<Layout><SubjectDetails /></Layout>} />
      </Route>

      {/* =========================================================================
          PARENT PORTAL ROUTES (Role-Based Route Guard: allowedRoles=['parent'])
          ========================================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route path="/parent" element={<Navigate to={`/parent/${parentId || ''}`} replace />} />
        <Route path="/parent/:parentId" element={<Layout><ParentDashboard /></Layout>} />
        <Route path="/parent/:parentId/child/:studentId" element={<Layout><ParentDashboard /></Layout>} />
        <Route path="/parent/child/:studentId" element={<Layout><ParentDashboard /></Layout>} />
      </Route>

      {/* Catch-all Fallback: Redirects unknown paths to role home or login */}
      <Route path="*" element={<Navigate to={user ? getUserHomePath(user) : '/login'} replace />} />
    </Routes>
  );
};

export default App;
