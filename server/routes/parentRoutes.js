const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('parent'));

router.get('/dashboard', parentController.getParentDashboard);
router.get('/child/:studentId', parentController.getParentDashboard);

module.exports = router;
