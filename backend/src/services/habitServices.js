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
 * Normaliza os campos do gatilho, transformando string vazia em null.
 * @param {object} habitData - Os dados recebidos do formulário.
 * @returns {object} Os campos do gatilho prontos para o Prisma.
 */
const parseCue = (habitData) => {
    const { cue, cueTime, intrinsic } = habitData;

    return {
        cue: cue && cue.trim() ? cue.trim() : null,
        cueTime: cueTime && cueTime.trim() ? cueTime.trim() : null,
        intrinsic: intrinsic === undefined ? undefined : Boolean(intrinsic),
    };
};

/**
 * Cria um novo hábito para um utilizador.
 * @param {object} habitData - Os dados do novo hábito (name, category, cue, cueTime, intrinsic).
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} O novo hábito criado.
 */
const createHabit = async (habitData, userId) => {
    const { name, category } = habitData;
    const { cue, cueTime, intrinsic } = parseCue(habitData);

    return await prisma.habit.create({
        data: {
            name,
            category,
            cue,
            cueTime,
            intrinsic: intrinsic ?? false,
            userId: userId,
        },
        include: {
            completions: true,
        },
    });
};

/**
 * Atualiza um hábito existente.
 * @param {string} habitId - O ID do hábito a ser atualizado.
 * @param {string} userId - O ID do utilizador.
 * @param {object} habitData - Os dados atualizados (name, category, cue, cueTime, intrinsic).
 * @returns {Promise<object>} O hábito atualizado.
 */

const updateHabit = async (habitId, userId, habitData) => {
    const { name, category } = habitData;
    const { cue, cueTime, intrinsic } = parseCue(habitData);

    // Verifica se o hábito pertence ao utilizador
    const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: userId },
    });

    if (!habit) {
        throw new Error('Hábito não encontrado ou não pertence ao utilizador.');
    }

    return await prisma.habit.update({
        where: { id: habitId },
        data: { name, category, cue, cueTime, intrinsic },
        include: {
            completions: true,
        },
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

/**
 * Marca ou desmarca um hábito como concluído para a data atual.
 * @param {string} habitId - O ID do hábito.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} O estado da conclusão.
 */
const toggleHabitCompletion = async (habitId, userId) => {
  // Garante que o hábito pertence ao utilizador
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: userId },
  });

  if (!habit) {
    throw new Error('Hábito não encontrado ou não pertence ao utilizador.');
  }

  // Pega na data de hoje, ignorando as horas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verifica se já existe uma conclusão para este hábito hoje
  const existingCompletion = await prisma.habitCompletion.findFirst({
    where: {
      habitId: habitId,
      date: today,
    },
  });

  if (existingCompletion) {
    // Se já foi concluído hoje, apaga a conclusão (desmarca)
    await prisma.habitCompletion.delete({
      where: { id: existingCompletion.id },
    });
    return { completed: false };
  } else {
    // Se não foi concluído hoje, cria uma nova conclusão (marca)
    await prisma.habitCompletion.create({
      data: {
        habitId: habitId,
        date: today,
      },
    });
    return { completed: true };
  }
};

module.exports = {
    findAllHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion
};