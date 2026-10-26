const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('teacher'));

router.get('/assignments', teacherController.getTeacherAssignedClasses);
router.get('/:teacherId/assignments', teacherController.getTeacherAssignedClasses);

router.get('/attendance', teacherController.getClassStudentsForAttendance);
router.get('/attendance/:classId', teacherController.getClassStudentsForAttendance);
router.get('/:teacherId/attendance/:classId', teacherController.getClassStudentsForAttendance);
router.post('/attendance', teacherController.saveAttendance);
router.post('/:teacherId/attendance', teacherController.saveAttendance);

router.get('/marks', teacherController.getClassMarks);
router.get('/marks/:classId', teacherController.getClassMarks);
router.get('/marks/:classId/:subjectId', teacherController.getClassMarks);
router.get('/:teacherId/marks/:classId', teacherController.getClassMarks);
router.get('/:teacherId/marks/:classId/:subjectId', teacherController.getClassMarks);
router.post('/marks', teacherController.saveMarks);
router.post('/:teacherId/marks', teacherController.saveMarks);

module.exports = router;
