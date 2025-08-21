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
        res.status(500).json({ error: 'Não foi possivel criar o hábito.' });
    }
};

module.exports = {
    getAllHabits,
    createNewHabit
};