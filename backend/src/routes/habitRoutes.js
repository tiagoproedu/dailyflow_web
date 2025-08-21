const express = require('express');
const router = express.Router();
const HabitController = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', HabitController.getAllHabits);
router.post('/', HabitController.createNewHabit);

module.exports = router;