const express = require('express');
const router = express.Router();
const HabitController = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', HabitController.getAllHabits);
router.post('/', HabitController.createNewHabit);
router.patch('/:id', HabitController.updateHabit);
router.delete('/:id', HabitController.deleteHabit);
router.post('/:id/toggle-completion', HabitController.toggleHabitCompletion);

module.exports = router;