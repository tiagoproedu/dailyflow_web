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

const updateTask = async (req, res) => {
  try {
    const {id} = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const updatedTask = await TaskService.updateTask(id, userId, updateData);
    res.json(updatedTask);
  } catch (error) {
    if (error.message.includes('Tarefa não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao atualizar o status da tarefa." });
  }
}

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await TaskService.deleteTask(id, userId);

    res.status(204).send();
  } catch (error) {
    if (error.message.includes('Tarefa não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao deletar a tarefa." });
  }
}

module.exports = {
  getAllTasks,
  createNewTask,
  updateTask,
  deleteTask,
};
