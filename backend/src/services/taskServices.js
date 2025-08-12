const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAllTasks = async () => {
    const tasks = await prisma.task.findMany({
        where: {isTemplate: false},
        orderBy: {createdAt: 'desc'},
    })
    return tasks;
};

const createTasks = async (taskData) => {
    const {text, description, priority} = taskData;
    const newTask = await prisma.task.create({
        data: {
            text,
            description,
            priority: priority || 'baixa',
        },
    });
    return newTask;
};

module.exports = {
    findAllTasks,
    createTasks
};