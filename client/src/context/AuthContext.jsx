/**
 * =========================================================================================
 * AUTHENTICATION CONTEXT & STATE PROVIDER
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): React Context API & State Management Hooks (useState, useEffect)
 *   - 24INMCAT307 (Software Engineering): Stateless JWT Session Management & Axios Interception
 * 
 * Key Features:
 *   1. createContext & AuthProvider: Provides global authentication data across the component tree.
 *   2. useState with lazy evaluation: Hydrates initial session state from browser localStorage.
 *   3. useEffect: Automatically injects or purges the 'Bearer <token>' HTTP Authorization header.
 *   4. login() & logout(): Handles asynchronous credentials submission and session teardown.
 * =========================================================================================
 */

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Authentication Context bus
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // useState Hook: Hydrate authenticated user object from browser localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // useState Hook: Hydrate JWT authentication token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('sms_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * useEffect Hook: Lifecycle synchronization side-effect.
   * Runs whenever 'token' state changes, attaching or deleting the Bearer Authorization
   * header on all outbound Axios HTTP requests to prevent unauthorized API calls.
   */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  /**
   * Asynchronous login handler:
   * Dispatches credentials to backend Express endpoint /api/auth/login,
   * stores returned token and user metadata into localStorage, and updates reactive state.
   */
  const login = async (login_id, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { login_id, password });
      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);

      // Persist session across browser refreshes
      localStorage.setItem('sms_token', newToken);
      localStorage.setItem('sms_user', JSON.stringify(userData));

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  /**
   * Logout handler:
   * Clears in-memory React state, removes localStorage items, and cleans Axios headers.
   */
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    // Context Provider exposes state variables and actions to all child components
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
