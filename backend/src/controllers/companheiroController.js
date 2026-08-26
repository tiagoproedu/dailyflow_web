const CompanheiroService = require('../services/companheiroServices');

/**
 * Dá um nome ao companheiro. O estado dele vai junto no `GET /dashboard`.
 */
const batizar = async (req, res) => {
    try {
        const resultado = await CompanheiroService.batizar(req.user.id, req.body.nome);
        res.json(resultado);
    } catch (error) {
        if (error.message === 'Utilizador não encontrado.') {
            return res.status(404).json({ error: error.message });
        }
        // As duas mensagens de validação vêm do próprio service e são para ler na tela.
        if (error.message.includes('nome')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Não foi possível dar o nome.' });
    }
};

module.exports = { batizar };
