const TaskService = require("../services/taskServices");

const getAllTasks = async (req, res) => {
  try {

    const userId = req.user.id;

    const tasks = await TaskService.findAllTasks(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

const createNewTask = async (req, res) => {
  try {
    
    const taskData = req.body;

    const userId = req.user.id;

    console.log("User ID:", userId);

    const newTask = await TaskService.createTask(taskData, userId);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Não foi possivel criar a tarefa." });
  }
};

module.exports = {
  getAllTasks,
  createNewTask,
};
