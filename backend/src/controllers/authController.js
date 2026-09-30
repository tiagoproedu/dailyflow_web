const AuthService = require('../services/authServices');

const register = async (req, res) => {
    try {
        const newUser = await AuthService.registerUser(req.body || {});
        res.status(201).json(newUser);
    } catch (error) {
        if (error instanceof AuthService.ErroDeValidacao) {
            return res.status(400).json({ error: error.message });
        }
        // Se o erro for "email já em uso", envia um status 409
        if (error.message === 'Este email já está em uso.') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: 'Erro ao registrar usuário.'});
    }
}

const login = async (req, res) => {
    try{
        const { user, token } = await AuthService.loginUser(req.body || {});
        res.json({ user, token });
    } catch (error) {
        // Só "credenciais inválidas" é 401. Uma falha do banco devolvia 401 com a
        // mensagem interna do Prisma na tela de login.
        if (error.message === 'Credenciais inválidas') {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }
        res.status(500).json({ error: 'Não foi possível entrar agora. Tente de novo.' });
    }
};

module.exports = {
    register,
    login
};
