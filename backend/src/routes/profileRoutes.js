const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', ProfileController.getProfile);

module.exports = router;
