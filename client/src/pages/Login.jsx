/**
 * =========================================================================================
 * AUTHENTICATION & LOGIN VIEW (Login.jsx)
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): Form State Management (useState), Semantic Feedback Alerts, useNavigate
 *   - 24INMCAT307 (Software Engineering): User Authentication & Role Gateway
 * 
 * Key Highlights:
 *   1. useState Hook: Controlled inputs for loginId and password.
 *   2. useContext Hook: Invokes login() action and captures error/loading flags from AuthContext.
 *   3. useNavigate Hook: Programmatically redirects authenticated users via getUserHomePath(user).
 *   4. Quick Demo Fill: Helper for rapid testing across Admin, Teacher, Student, and Parent accounts.
 * =========================================================================================
 */

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserHomePath } from '../utils/navigation';
import { GraduationCap, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  // useState Hooks: Bound to controlled input form elements
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('123@');

  // useContext Hook: Consume centralized auth functions & error state
  const { login, loading, error, setError } = useContext(AuthContext);

  // useNavigate Hook: Programmatic routing after successful login
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please fill in both Login ID and Password.');
      return;
    }
    try {
      const user = await login(loginId, password);
      // Redirect based on role and their dynamic user ID (e.g. /teacher/1, /student/2, /admin)
      navigate(getUserHomePath(user));
    } catch (err) {
      // Error handled in AuthContext and displayed via alert banner
    }
  };

  const handleQuickLogin = (id, pass = '123@') => {
    setLoginId(id);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-3">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-sm text-gray-500 mt-1">Select demo role or enter your credentials to log in</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Login ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. admin, TCH101, STD201, PRN301"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Default: 123@"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Default password for all demo accounts is <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-blue-600">123@</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Log In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
              Quick One-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200 transition text-left"
              >
                <div className="font-bold">Admin Portal</div>
                <div className="text-[11px] opacity-80">ID: admin</div>
              </button>

              <button
                onClick={() => handleQuickLogin('TCH101')}
                className="px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition text-left"
              >
                <div className="font-bold">Teacher Portal</div>
                <div className="text-[11px] opacity-80">ID: TCH101</div>
              </button>

              <button
                onClick={() => handleQuickLogin('STD201')}
                className="px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition text-left"
              >
                <div className="font-bold">Student Portal</div>
                <div className="text-[11px] opacity-80">ID: STD201</div>
              </button>

              <button
                onClick={() => handleQuickLogin('PRN301')}
                className="px-3 py-2 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition text-left"
              >
                <div className="font-bold">Parent Portal</div>
                <div className="text-[11px] opacity-80">ID: PRN301</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-400">
          Student Management System &copy; 2026. Powered by Node.js & React.
        </div>
      </div>
    </div>
  );
};

export default Login;
