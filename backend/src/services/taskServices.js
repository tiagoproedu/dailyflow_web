const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAllTasks = async (userId) => {
    const tasks = await prisma.task.findMany({
        where: {isTemplate: false, userId: userId},
        orderBy: {createdAt: 'desc'},
    })
    return tasks;
};

const createTask = async (taskData, userId) => {
    const {text, description, priority} = taskData;

    if (typeof text !== 'string' || !text.trim()) {
        throw new Error('O texto da tarefa é obrigatório.');
    }
    const newTask = await prisma.task.create({
        data: {
            userId,
            text: text.trim(),
            description,
            priority: priority || 'baixa',
        },
    });
    return newTask;
};

const updateTask = async (taskId, userId, updateData) => {
  // 1. Verifica se a tarefa pertence ao utilizador
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: userId },
  });

  if (!task) {
    throw new Error('Tarefa não encontrada ou não pertence ao utilizador.');
  }

  // 2. Atualiza a tarefa com os novos dados recebidos
  const dataToUpdate = {};
  if (updateData.text !== undefined) {
    if (typeof updateData.text !== 'string' || !updateData.text.trim()) {
      throw new Error('O texto da tarefa é obrigatório.');
    }
    dataToUpdate.text = updateData.text.trim();
  }
  if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
  if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
  if (updateData.completed !== undefined) {
    dataToUpdate.completed = updateData.completed;
    dataToUpdate.completedAt = updateData.completed ? new Date() : null;
  }

  const updatedTask = await prisma.task.update({
    where: {id: taskId},
    data: dataToUpdate,
  });

  return updatedTask;
};

const deleteTask = async (taskId, userId) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId: userId,
        }
    });

    if (!task) {
        throw new Error("Tarefa não encontrada ou não pertence ao usuário.");
    }

    await prisma.task.delete({
        where: {
            id: taskId,
        }
    });

    return;
}

module.exports = {
    findAllTasks,
    createTask,
    updateTask,
    deleteTask,
};