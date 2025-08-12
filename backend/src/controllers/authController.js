const AuthService = require('../services/authServices');

const register = async (req, res) => {
    try {
        const newUser = await AuthService.registerUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        // Se o erro for "email já em uso", envia um status 409
        if (error.message === 'Este email já está em uso.') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: 'Erro ao registrar usuário.'});
    }
}

const login = async (req, res) => {
    try{
        const { user, token } = await AuthService.loginUser(req.body);
        res.json({ user, token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = {
    register,
    login
};