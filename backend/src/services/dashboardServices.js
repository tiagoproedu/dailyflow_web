const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const DAYS_IN_STRIP = 5;

/**
 * Devolve as últimas N datas (à meia-noite), da mais antiga para a mais recente.
 * @param {number} amount - Quantos dias devolver.
 * @returns {Array<Date>} As datas.
 */
const lastDays = (amount) => {
    const days = [];

    for (let i = amount - 1; i >= 0; i--) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        days.push(day);
    }

    return days;
};

/**
 * Descobre o período do dia atual, para destacar as rotinas relevantes.
 * @returns {string} 'Manhã', 'Tarde' ou 'Noite'.
 */
const currentTimeOfDay = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Manhã';
    if (hour < 18) return 'Tarde';
    return 'Noite';
};

/**
 * Reúne todos os números e listas que o Dashboard mostra.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} O resumo do dia.
 */
const getSummary = async (userId) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const days = lastDays(DAYS_IN_STRIP);

    const [user, pendingTasks, completedToday, habits, routines] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, avatarInitial: true, virtualCoins: true, memberSince: true },
        }),
        prisma.task.findMany({
            where: { userId: userId, completed: false, isTemplate: false },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.task.count({
            where: {
                userId: userId,
                isTemplate: false,
                completed: true,
                completedAt: { gte: startOfDay },
            },
        }),
        prisma.habit.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                completions: {
                    where: { date: { gte: days[0] } },
                },
            },
        }),
        prisma.routine.findMany({
            where: { userId: userId, active: true },
            include: {
                templateTasks: { where: { isTemplate: true } },
            },
        }),
    ]);

    const timeOfDay = currentTimeOfDay();

    // Para cada hábito, monta a faixa dos últimos dias — é isso que desenha os pontinhos
    const habitsToday = habits.map((habit) => {
        const completedDates = habit.completions.map((completion) =>
            new Date(completion.date).toISOString().slice(0, 10)
        );

        return {
            id: habit.id,
            name: habit.name,
            category: habit.category,
            currentStreak: habit.currentStreak,
            completedToday: completedDates.includes(
                new Date(startOfDay).toISOString().slice(0, 10)
            ),
            lastDays: days.map((day) => ({
                date: day.toISOString().slice(0, 10),
                completed: completedDates.includes(day.toISOString().slice(0, 10)),
            })),
        };
    });

    const routinesToday = routines.map((routine) => ({
        id: routine.id,
        name: routine.name,
        timeOfDay: routine.timeOfDay,
        taskCount: routine.templateTasks.length,
        isNow: routine.timeOfDay === timeOfDay,
    }));

    return {
        user,
        timeOfDay,
        stats: {
            pendingTasks: pendingTasks.length,
            completedToday,
            activeHabits: habits.length,
            habitsDoneToday: habitsToday.filter((habit) => habit.completedToday).length,
            activeRoutines: routines.length,
            routinesNow: routinesToday.filter((routine) => routine.isNow).length,
        },
        recentTasks: pendingTasks.slice(0, 5),
        habitsToday,
        routinesToday,
    };
};

module.exports = { getSummary };
