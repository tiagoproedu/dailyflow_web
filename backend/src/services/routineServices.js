const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Garante que a rotina existe e pertence ao utilizador.
 * @param {string} routineId - O ID da rotina.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} A rotina encontrada.
 */
const ensureOwnership = async (routineId, userId) => {
    const routine = await prisma.routine.findFirst({
        where: { id: routineId, userId: userId },
    });

    if (!routine) {
        throw new Error('Rotina não encontrada ou não pertence ao utilizador.');
    }

    return routine;
};

/**
 * Busca todas as rotinas de um utilizador específico.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<Array>} A lista de rotinas com as suas tarefas-modelo.
 */
const findAllRoutines = async (userId) => {
    return await prisma.routine.findMany({
        where: { userId: userId },
        orderBy: { name: 'asc' },
        include: {
            templateTasks: {
                where: { isTemplate: true },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
};

/**
 * Cria uma nova rotina, junto das suas tarefas-modelo.
 * @param {object} routineData - Os dados da rotina (name, description, timeOfDay, tasks).
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} A nova rotina criada.
 */
const createRoutine = async (routineData, userId) => {
    const { name, description, timeOfDay, tasks = [] } = routineData;

    return await prisma.routine.create({
        data: {
            name,
            description,
            timeOfDay,
            userId: userId,
            templateTasks: {
                create: tasks
                    .filter((text) => text && text.trim())
                    .map((text) => ({
                        text: text.trim(),
                        priority: 'media',
                        isTemplate: true,
                        userId: userId,
                    })),
            },
        },
        include: {
            templateTasks: { orderBy: { createdAt: 'asc' } },
        },
    });
};

/**
 * Atualiza uma rotina existente.
 * @param {string} routineId - O ID da rotina.
 * @param {string} userId - O ID do utilizador.
 * @param {object} routineData - Os dados atualizados (name, description, timeOfDay, active).
 * @returns {Promise<object>} A rotina atualizada.
 */
const updateRoutine = async (routineId, userId, routineData) => {
    await ensureOwnership(routineId, userId);

    const { name, description, timeOfDay, active } = routineData;

    return await prisma.routine.update({
        where: { id: routineId },
        data: { name, description, timeOfDay, active },
        include: {
            templateTasks: {
                where: { isTemplate: true },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
};

/**
 * Apaga uma rotina e as suas tarefas-modelo.
 * @param {string} routineId - O ID da rotina.
 * @param {string} userId - O ID do utilizador.
 */
const deleteRoutine = async (routineId, userId) => {
    await ensureOwnership(routineId, userId);

    // As tarefas já executadas guardam o histórico, por isso apagamos apenas os modelos
    // e desligamos as restantes da rotina antes de a remover.
    await prisma.task.deleteMany({
        where: { routineId: routineId, isTemplate: true },
    });

    await prisma.task.updateMany({
        where: { routineId: routineId },
        data: { routineId: null },
    });

    await prisma.routine.delete({
        where: { id: routineId },
    });
};

/**
 * Acrescenta uma tarefa-modelo a uma rotina.
 * @param {string} routineId - O ID da rotina.
 * @param {string} userId - O ID do utilizador.
 * @param {object} taskData - Os dados da tarefa (text, priority).
 * @returns {Promise<object>} A tarefa-modelo criada.
 */
const addTemplateTask = async (routineId, userId, taskData) => {
    await ensureOwnership(routineId, userId);

    const { text, priority = 'media' } = taskData;

    return await prisma.task.create({
        data: {
            text,
            priority,
            isTemplate: true,
            userId: userId,
            routineId: routineId,
        },
    });
};

/**
 * Remove uma tarefa-modelo de uma rotina.
 * @param {string} routineId - O ID da rotina.
 * @param {string} taskId - O ID da tarefa-modelo.
 * @param {string} userId - O ID do utilizador.
 */
const removeTemplateTask = async (routineId, taskId, userId) => {
    await ensureOwnership(routineId, userId);

    const task = await prisma.task.findFirst({
        where: { id: taskId, routineId: routineId, userId: userId, isTemplate: true },
    });

    if (!task) {
        throw new Error('Tarefa-modelo não encontrada nesta rotina.');
    }

    await prisma.task.delete({
        where: { id: taskId },
    });
};

/**
 * Inicia uma rotina: copia as tarefas-modelo para tarefas reais do dia.
 * Se a rotina já tiver sido iniciada hoje, devolve as tarefas existentes.
 * @param {string} routineId - O ID da rotina.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<object>} As tarefas do dia e se já tinham sido criadas.
 */
const startRoutine = async (routineId, userId) => {
    await ensureOwnership(routineId, userId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Evita duplicar as tarefas se o utilizador clicar em "Iniciar" duas vezes no mesmo dia
    const alreadyStarted = await prisma.task.findMany({
        where: {
            routineId: routineId,
            userId: userId,
            isTemplate: false,
            createdAt: { gte: startOfDay },
        },
    });

    if (alreadyStarted.length > 0) {
        return { alreadyStarted: true, tasks: alreadyStarted };
    }

    const templateTasks = await prisma.task.findMany({
        where: { routineId: routineId, userId: userId, isTemplate: true },
        orderBy: { createdAt: 'asc' },
    });

    if (templateTasks.length === 0) {
        throw new Error('Esta rotina ainda não tem tarefas.');
    }

    await prisma.task.createMany({
        data: templateTasks.map((template) => ({
            text: template.text,
            description: template.description,
            priority: template.priority,
            isTemplate: false,
            userId: userId,
            routineId: routineId,
        })),
    });

    const tasks = await prisma.task.findMany({
        where: {
            routineId: routineId,
            userId: userId,
            isTemplate: false,
            createdAt: { gte: startOfDay },
        },
    });

    return { alreadyStarted: false, tasks };
};

module.exports = {
    findAllRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    addTemplateTask,
    removeTemplateTask,
    startRoutine
};
