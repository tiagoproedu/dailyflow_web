const {PrismaClient} = require('@prisma/client');
const StreakServices = require('./streakServices');
const prisma = new PrismaClient();

/**
 * Anexa a sequência, a consistência e as repetições a um hábito.
 * Os números são sempre calculados a partir das conclusões, nunca guardados — ver
 * o cabeçalho de `streakServices.js`.
 * @param {object} habito - O hábito com as suas `completions`.
 * @returns {object} O hábito com o campo `estatisticas`.
 */
const comEstatisticas = (habito) => ({
    ...habito,
    estatisticas: StreakServices.calcularEstatisticas(habito),
});

/**
 * Busca todos os hábitos de um utilizador específico.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<Array>} A lista de hábitos, cada um com as suas estatísticas.
 */

const findAllHabits = async (userId) => {
    const habitos = await prisma.habit.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            completions: true,
        },
    });

    return habitos.map(comEstatisticas);
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

    const habito = await prisma.habit.create({
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

    return comEstatisticas(habito);
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

    const atualizado = await prisma.habit.update({
        where: { id: habitId },
        data: { name, category, cue, cueTime, intrinsic },
        include: {
            completions: true,
        },
    });

    return comEstatisticas(atualizado);
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
 *
 * Devolve as estatísticas **já recalculadas**: é com elas que a tela monta o
 * reconhecimento do momento da marcação. O número tem de vir do servidor, senão o
 * app acabaria a elogiar uma sequência que ele mesmo adivinhou.
 *
 * @param {string} habitId - O ID do hábito.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} O estado da conclusão e as estatísticas atualizadas.
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
  } else {
    // Se não foi concluído hoje, cria uma nova conclusão (marca)
    await prisma.habitCompletion.create({
      data: {
        habitId: habitId,
        date: today,
      },
    });
  }

  // Relê as conclusões depois da escrita: a sequência devolvida é a que ficou
  // gravada, não uma previsão do que devia ter acontecido.
  const atualizado = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { completions: true },
  });

  return {
    completed: !existingCompletion,
    estatisticas: StreakServices.calcularEstatisticas(atualizado),
  };
};

/**
 * Marca um hábito como feito hoje. Nunca desmarca.
 *
 * É a operação por trás do botão "Feito ✓" da notificação, e por isso é **marcar** e não
 * alternar: quem toca ali quer registar que fez. Se o toque fosse um `toggle`, tocar numa
 * notificação antiga apagaria a conclusão do dia — o oposto exato da intenção.
 *
 * Repetir a chamada é inofensivo: se já estava marcado, não duplica nada.
 *
 * @param {string} habitId - O ID do hábito.
 * @param {string} userId - O ID do utilizador dono do hábito.
 * @param {string} dia - O dia a que o lembrete se referia, formato "AAAA-MM-DD".
 * @returns {Promise<object>} O nome, se já estava marcado e as estatísticas atualizadas.
 */
const marcarHabitoNoDia = async (habitId, userId, dia) => {
    const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: userId },
    });

    if (!habit) {
        throw new Error('Hábito não encontrado ou não pertence ao utilizador.');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Uma notificação de ontem que ficou na gaveta não pode marcar o dia de hoje.
    if (dia !== StreakServices.chaveDeHoje(hoje)) {
        throw new Error('Este lembrete é de outro dia.');
    }

    const existente = await prisma.habitCompletion.findFirst({
        where: { habitId: habitId, date: hoje },
    });

    if (!existente) {
        await prisma.habitCompletion.create({
            data: { habitId: habitId, date: hoje },
        });
    }

    const atualizado = await prisma.habit.findUnique({
        where: { id: habitId },
        include: { completions: true },
    });

    return {
        nome: habit.name,
        jaEstava: Boolean(existente),
        estatisticas: StreakServices.calcularEstatisticas(atualizado),
    };
};

module.exports = {
    findAllHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    marcarHabitoNoDia
};