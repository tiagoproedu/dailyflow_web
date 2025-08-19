const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// Todas as rotas abaixo precisam de autenticação
router.use(protect);

// Rota para buscar todas as tarefas
router.get('/', TaskController.getAllTasks);

// Rota para criar uma nova tarefa
router.post('/', TaskController.createNewTask);

// Rota para atualizar o status de uma tarefa
router.patch('/:id', TaskController.updateTask);

// Rota para deletar uma tarefa
router.delete('/:id', TaskController.deleteTask);

module.exports = router;