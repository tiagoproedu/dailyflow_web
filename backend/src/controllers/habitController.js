const HabitService = require('../services/habitServices');

const getAllHabits = async (req, res) => {
    try {
        const userId = req.user.id;
        const habits = await HabitService.findAllHabits(userId);
        res.json(habits);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possivel buscar os hábitos.' });
    }
};

const createNewHabit = async (req, res) => {
    try {
        const userId = req.user.id;
        const newHabit = await HabitService.createHabit(req.body, userId);
        res.status(201).json(newHabit);
    } catch (error) {
        if (error.message.includes('obrigatório')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel criar o hábito.' });
    }
};

const updateHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updatedHabit = await HabitService.updateHabit(id, userId, req.body);
        res.json(updatedHabit);
    } catch (error) {
        if (error.message.includes('Hábito não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('obrigatório')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel atualizar o hábito.' });
    }
};

const deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await HabitService.deleteHabit(id, userId);
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('Hábito não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel apagar o hábito.' });
    }
};

const toggleHabitCompletion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await HabitService.toggleHabitCompletion(id, userId);
        res.json(result);
    } catch (error) {
        if (error.message.includes('Hábito não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possivel alternar a conclusão do hábito.' });
    }
}

module.exports = {
    getAllHabits,
    createNewHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion
};