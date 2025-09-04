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

/**
 * Atualiza um hábito existente.
 * @param {string} habitId - O ID do hábito a ser atualizado.
 * @param {string} userId - O ID do utilizador.
 * @param {object} habitData - Os dados atualizados do hábito (name, category).
 * @returns {Promise<object>} O hábito atualizado.
 */

const updateHabit = async (habitId, userId, habitData) => {
    const { name, category } = habitData;

    // Verifica se o hábito pertence ao utilizador
    const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: userId },
    });

    if (!habit) {
        throw new Error('Hábito não encontrado ou não pertence ao utilizador.');
    }

    return await prisma.habit.update({
        where: { id: habitId },
        data: { name, category },
    });
};

/**
 * Apaga um hábito existente.
 * @param {string} habitId - O ID do hábito a ser apagado.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} O hábito apagado.
 */

const deleteHabit = async (habitId, userId) => {
    // Verifica se o hábito pertence ao utilizador
    const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: userId },
    });

    if (!habit) {
        throw new Error('Hábito não encontrado ou não pertence ao utilizador.');
    }

    await prisma.habit.delete({
        where: { id: habitId },
    });
};

module.exports = {
    findAllHabits,
    createHabit,
    updateHabit,
    deleteHabit
};