/**
 * =========================================================================================
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * =========================================================================================
 * Laboratory Course Reference:
 *   - 24INMCAT307: Software Engineering (Role-Based Access Control & Security Middleware)
 *   - 24INMCAL393: User Interface and Design Lab (Token-based API Authorization)
 * 
 * Mechanics:
 *   1. verifyToken: Intercepts the HTTP 'Authorization: Bearer <token>' header, verifies
 *      cryptographic signature against JWT_SECRET, and binds decoded user to req.user.
 *   2. authorizeRoles(...roles): Higher-order guard function ensuring the authenticated
 *      user's role matches the required permission set before proceeding to the controller.
 * =========================================================================================
 */

const jwt = require('jsonwebtoken');

// Token Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No authorization token provided.' });
  }

  // Extract token from 'Bearer <token>' string
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Malformed token.' });
  }

  try {
    // Cryptographically verify token authenticity and check 24-hour expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_student_mgmt_key_12345');
    req.user = decoded; // Bind decoded identity to request object
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Role-Based Authorization Guard Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: Insufficient role permissions.' });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
