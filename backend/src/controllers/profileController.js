const ProfileService = require('../services/profileServices');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await ProfileService.getProfile(userId);
        res.json(profile);
    } catch (error) {
        if (error.message === 'Utilizador não encontrado.') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possível carregar o perfil.' });
    }
};

module.exports = { getProfile };
