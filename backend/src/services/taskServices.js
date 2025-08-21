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
    console.log("Creating task with data:", taskData, "for user ID:", userId);
    const {text, description, priority} = taskData;
    const newTask = await prisma.task.create({
        data: {
            userId,
            text,
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
  if (updateData.text !== undefined) dataToUpdate.text = updateData.text;
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