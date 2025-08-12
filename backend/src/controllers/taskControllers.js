const TaskService = require("../services/taskServices");

const getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskService.findAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

const createNewTask = async (req, res) => {
  try {
    const newTask = await TaskService.createTasks(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Não foi possivel criar a tarefa." });
  }
};

module.exports = {
  getAllTasks,
  createNewTask,
};
