/**
 * =========================================================================================
 * AUTHENTICATION CONTROLLER & JWT TOKEN GENERATOR
 * =========================================================================================
 * Laboratory Courses Reference:
 *   - 24INMCAT307: Software Engineering (Identity & Access Management, Cryptography)
 *   - 24INMCAL391: RDBMS Lab (Parameterized Prepared Queries, SQL Injection Prevention)
 * 
 * Key Highlights:
 *   1. Parameterized Prepared Query: Uses '?' placeholder to prevent SQL Injection attacks.
 *   2. Cryptographic Verification: bcrypt.compare verifies password against salted hash.
 *   3. Domain Identity Extraction: Joins role-specific tables (students, teachers, parents)
 *      to inject domain primary keys (student_id, teacher_id) directly into token.
 *   4. Stateless JWT Signing: Generates digitally signed JSON Web Token with 24h expiration.
 * =========================================================================================
 */

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ message: 'Login ID and password are required.' });
  }

  try {
    // Step 1 (RDBMS Lab: Parameterized Query): Prevents SQL Injection via '?' placeholder
    const [users] = await pool.query('SELECT * FROM users WHERE login_id = ?', [login_id.trim()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid Login ID or Password.' });
    }

    const user = users[0];
    
    // Step 2 (Software Engineering: Cryptographic Comparison): Compare hash with plaintext password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Login ID or Password.' });
    }

    // Step 3: Fetch domain-specific metadata according to user role
    let roleDetails = {};
    if (user.role === 'student') {
      const [stds] = await pool.query(
        `SELECT s.id as student_id, s.roll_number, s.class_id, c.class_name, c.section 
         FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.user_id = ?`,
        [user.id]
      );
      if (stds.length > 0) roleDetails = stds[0];
    } else if (user.role === 'teacher') {
      const [tchs] = await pool.query(
        `SELECT id as teacher_id, employee_id, department FROM teachers WHERE user_id = ?`,
        [user.id]
      );
      if (tchs.length > 0) roleDetails = tchs[0];
    } else if (user.role === 'parent') {
      const [prns] = await pool.query(
        `SELECT id as parent_id, occupation FROM parents WHERE user_id = ?`,
        [user.id]
      );
      if (prns.length > 0) roleDetails = prns[0];
    }

    // Step 4: Construct token payload
    const tokenPayload = {
      id: user.id,
      login_id: user.login_id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...roleDetails
    };

    // Step 5: Issue signed JWT token with 24-hour expiration
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'super_secret_student_mgmt_key_12345',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: tokenPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, login_id, role, name, email, phone FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password.' });
  }
};
