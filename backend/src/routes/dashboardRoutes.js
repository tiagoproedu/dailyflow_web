const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', DashboardController.getSummary);

module.exports = router;
