const DashboardService = require('../services/dashboardServices');

const getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const summary = await DashboardService.getSummary(userId);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possivel carregar o dashboard.' });
    }
};

module.exports = { getSummary };
