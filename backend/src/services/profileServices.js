const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Reúne os dados reais do utilizador e os números que ele já produziu no app.
 *
 * Só entram estatísticas que saem de registos existentes. Nada é estimado: se o
 * número não puder ser contado a partir do banco, ele não aparece na tela.
 *
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} Dados pessoais e estatísticas.
 */
const getProfile = async (userId) => {
    const [user, habitsCompleted, activeHabits, tasksCompleted, activeRoutines, habitsWithReminder] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                avatarInitial: true,
                memberSince: true,
            },
        }),
        // Cada registo é um hábito marcado num dia.
        prisma.habitCompletion.count({
            where: { habit: { userId } },
        }),
        prisma.habit.count({
            where: { userId },
        }),
        prisma.task.count({
            where: { userId, isTemplate: false, completed: true },
        }),
        prisma.routine.count({
            where: { userId, active: true },
        }),
        // Sem horário de gatilho não há lembrete possível — a tela avisa quando é zero.
        prisma.habit.count({
            where: { userId, cueTime: { not: null } },
        }),
    ]);

    if (!user) {
        throw new Error('Utilizador não encontrado.');
    }

    return {
        name: user.name,
        email: user.email,
        // A inicial é derivada do nome quando o utilizador nunca escolheu uma.
        avatarInitial: user.avatarInitial || user.name.trim().charAt(0).toUpperCase(),
        memberSince: user.memberSince,
        stats: {
            habitsCompleted,
            activeHabits,
            tasksCompleted,
            activeRoutines,
            habitsWithReminder,
        },
    };
};

module.exports = { getProfile };
