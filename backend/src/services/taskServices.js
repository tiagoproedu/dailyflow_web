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

module.exports = {
    findAllTasks,
    createTask
};