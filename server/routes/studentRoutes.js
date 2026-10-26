const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('student'));

router.get('/dashboard', studentController.getStudentDashboard);
router.get('/subjects/:subjectId', studentController.getSubjectDetails);

module.exports = router;
