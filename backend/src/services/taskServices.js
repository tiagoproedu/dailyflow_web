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
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      text: updateData.text,
      description: updateData.description,
      priority: updateData.priority,
      completed: updateData.completed,
      completedAt: updateData.completed ? new Date() : null,
    },
  });
  return updatedTask;
};

const deleteTask = async (taksId, userId) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taksId,
            userId: userId,
        }
    });

    if (!task) {
        throw new Error("Tarefa não encontrada ou não pertence ao usuário.");
    }

    await prisma.task.delete({
        where: {
            id: taksId,
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