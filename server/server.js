/**
 * =========================================================================================
 * EXPRESS REST API SERVER ENTRYPOINT (server.js)
 * =========================================================================================
 * Laboratory Course Reference:
 *   - 24INMCAT307: Software Engineering (3-Tier Layered Architecture: Application/Logic Tier)
 *   - 24INMCAL391: RDBMS Lab (RESTful API Gateway interfacing with XAMPP MariaDB)
 * 
 * Architectural Highlights:
 *   1. Application Layer: Built using Node.js and Express.js framework.
 *   2. Modular Routing: Routes are decoupled by domain (/api/auth, /api/admin, /api/teacher, /api/student, /api/parent).
 *   3. Middleware Pipeline: Configured with CORS for cross-origin client requests and JSON body parsing.
 *   4. Stateless Protocol: Communicates asynchronously via JSON payloads secured by JWT authorization headers.
 * =========================================================================================
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Domain Route Modules
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Pipeline
app.use(cors());              // Enable Cross-Origin Resource Sharing for Vite client (localhost:5173)
app.use(express.json());      // Parse incoming JSON request bodies

// Modular RESTful Route Mounts
app.use('/api/auth', authRoutes);         // Authentication & token issuance
app.use('/api/admin', adminRoutes);       // Institutional master management & analytics
app.use('/api/teacher', teacherRoutes);   // Attendance marking & gradebook input
app.use('/api/student', studentRoutes);   // Student academic dashboard & transcripts
app.use('/api/parent', parentRoutes);     // Parent ward monitoring & fee alerts

// Health check verification endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Student Management Server is running smoothly.' });
});

// Launch server listener
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
