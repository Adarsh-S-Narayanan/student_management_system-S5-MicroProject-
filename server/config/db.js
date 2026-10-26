/**
 * =========================================================================================
 * RELATIONAL DATABASE CONNECTION POOL CONFIGURATION
 * =========================================================================================
 * Laboratory Course Reference:
 *   - 24INMCAL391: RDBMS Lab (Database Connectivity & Asynchronous Pool Architecture)
 *   - 24INMCAT307: Software Engineering (3-Tier Layered Architecture: Data Access Tier)
 * 
 * Technical Implementation:
 *   1. Engine: MariaDB / MySQL Community Server hosted on the XAMPP stack (localhost:3306).
 *   2. Driver: 'mysql2/promise' providing asynchronous Promise-based query execution.
 *   3. Connection Pooling: Maintains a persistent pool of 10 reusable connections,
 *      eliminating the latency of TCP three-way handshakes for every HTTP request.
 *   4. ACID Transactions: pool.getConnection() yields individual connections capable of
 *      executing beginTransaction(), commit(), and rollback().
 * =========================================================================================
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool with environment-driven configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_management_db',
  waitForConnections: true,  // Queue incoming requests if all 10 connections are busy
  connectionLimit: 10,       // Maximum active connections allocated in pool
  queueLimit: 0              // Unlimited request queue size
});

module.exports = pool;
