const RoutineService = require('../services/routineServices');

const getAllRoutines = async (req, res) => {
    try {
        const userId = req.user.id;
        const routines = await RoutineService.findAllRoutines(userId);
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possivel buscar as rotinas.' });
    }
};

const createNewRoutine = async (req, res) => {
    try {
        const userId = req.user.id;
        const newRoutine = await RoutineService.createRoutine(req.body, userId);
        res.status(201).json(newRoutine);
    } catch (error) {
        if (error.message.includes('obrigatório') || error.message.includes('inválida')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel criar a rotina.' });
    }
};

const updateRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updatedRoutine = await RoutineService.updateRoutine(id, userId, req.body);
        res.json(updatedRoutine);
    } catch (error) {
        if (error.message.includes('Rotina não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel atualizar a rotina.' });
    }
};

const deleteRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await RoutineService.deleteRoutine(id, userId);
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('Rotina não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel apagar a rotina.' });
    }
};

const addTemplateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const task = await RoutineService.addTemplateTask(id, userId, req.body);
        res.status(201).json(task);
    } catch (error) {
        if (error.message.includes('Rotina não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('obrigatório')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel adicionar a tarefa à rotina.' });
    }
};

const removeTemplateTask = async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const userId = req.user.id;
        await RoutineService.removeTemplateTask(id, taskId, userId);
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel remover a tarefa da rotina.' });
    }
};

const startRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await RoutineService.startRoutine(id, userId);
        res.json(result);
    } catch (error) {
        if (error.message.includes('Rotina não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('ainda não tem tarefas')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel iniciar a rotina.' });
    }
};

module.exports = {
    getAllRoutines,
    createNewRoutine,
    updateRoutine,
    deleteRoutine,
    addTemplateTask,
    removeTemplateTask,
    startRoutine
};
