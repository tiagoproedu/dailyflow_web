const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

// Rota para buscar todas as tarefas
router.get('/', TaskController.getAllTasks);

// Rota para criar uma nova tarefa
router.post('/', TaskController.createNewTask);

module.exports = router;