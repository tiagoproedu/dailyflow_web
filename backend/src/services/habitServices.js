const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Busca todos os hábitos de um utilizador específico.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<Array>} A lista de hábitos.
 */

const findAllHabits = async (userId) => {
    return await prisma.habit.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            completions: true,
        },
    });
};

/**
 * Cria um novo hábito para um utilizador.
 * @param {object} habitData - Os dados do novo hábito (name, category).
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} O novo hábito criado.
 */
const createHabit = async (habitData, userId) => {
    const { name, category } = habitData;
    return await prisma.habit.create({
        data: {
            name,
            category,
            userId: userId,
        },
    });
};

module.exports = {
    findAllHabits,
    createHabit
};