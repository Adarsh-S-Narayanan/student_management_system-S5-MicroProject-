const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Students
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);
router.post('/students', adminController.addStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Teachers
router.get('/teachers', adminController.getAllTeachers);
router.get('/teachers/:id', adminController.getTeacherById);
router.post('/teachers', adminController.addTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Parents
router.get('/parents', adminController.getAllParents);
router.post('/parents', adminController.addParent);

// Classes & Subjects
router.get('/classes', adminController.getAllClasses);
router.get('/classes/:id', adminController.getClassById);
router.post('/classes', adminController.addClass);
router.get('/subjects', adminController.getAllSubjects);
router.post('/subjects', adminController.addSubject);

// Fees
router.get('/fees', adminController.getAllFees);
router.post('/fees', adminController.addFeeRecord);
router.patch('/fees/:id/status', adminController.updateFeeStatus);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

module.exports = router;
