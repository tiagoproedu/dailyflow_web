const express = require('express');
const router = express.Router();
const RoutineController = require('../controllers/routineController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', RoutineController.getAllRoutines);
router.post('/', RoutineController.createNewRoutine);
router.patch('/:id', RoutineController.updateRoutine);
router.delete('/:id', RoutineController.deleteRoutine);
router.post('/:id/tasks', RoutineController.addTemplateTask);
router.delete('/:id/tasks/:taskId', RoutineController.removeTemplateTask);
router.post('/:id/start', RoutineController.startRoutine);

module.exports = router;
