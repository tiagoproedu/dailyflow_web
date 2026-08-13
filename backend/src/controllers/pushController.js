const PushServices = require('../services/pushServices');

/**
 * Devolve a chave pública VAPID e se o servidor consegue mesmo enviar lembretes.
 */
const getChavePublica = (req, res) => {
    const chave = PushServices.getChavePublica();

    if (!chave) {
        return res.status(503).json({ error: 'Os lembretes não estão configurados neste servidor.' });
    }

    return res.status(200).json({ chavePublica: chave });
};

/**
 * Regista o aparelho para receber lembretes.
 */
const inscrever = async (req, res) => {
    try {
        await PushServices.inscrever(req.user.id, req.body);
        const aparelhos = await PushServices.contarAparelhos(req.user.id);
        return res.status(201).json({ inscrito: true, aparelhos });
    } catch (error) {
        if (error.message === 'Inscrição inválida.') {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erro ao inscrever no push:', error);
        return res.status(500).json({ error: 'Não foi possível ligar os lembretes.' });
    }
};

/**
 * Remove o aparelho da lista de lembretes.
 */
const cancelar = async (req, res) => {
    try {
        await PushServices.cancelar(req.user.id, req.body?.endpoint);
        const aparelhos = await PushServices.contarAparelhos(req.user.id);
        return res.status(200).json({ inscrito: aparelhos > 0, aparelhos });
    } catch (error) {
        if (error.message === 'Inscrição inválida.') {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erro ao cancelar push:', error);
        return res.status(500).json({ error: 'Não foi possível desligar os lembretes.' });
    }
};

/**
 * Estado atual: quantos aparelhos deste utilizador recebem lembretes.
 */
const getEstado = async (req, res) => {
    try {
        const aparelhos = await PushServices.contarAparelhos(req.user.id);
        return res.status(200).json({ inscrito: aparelhos > 0, aparelhos });
    } catch (error) {
        console.error('Erro ao ler estado do push:', error);
        return res.status(500).json({ error: 'Não foi possível ler o estado dos lembretes.' });
    }
};

/**
 * Dispara um lembrete de teste, para o utilizador confirmar que chega ao aparelho.
 */
const testar = async (req, res) => {
    try {
        const resultado = await PushServices.enviarParaUtilizador(req.user.id, {
            titulo: 'DailyFlow',
            corpo: 'Funcionou. É assim que os seus lembretes vão chegar.',
            url: '/dashboard',
            tag: 'teste',
        });

        if (resultado.enviadas === 0) {
            return res.status(409).json({ error: 'Nenhum aparelho inscrito recebeu o teste.' });
        }

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Erro ao testar push:', error);
        return res.status(500).json({ error: 'Não foi possível enviar o teste.' });
    }
};

module.exports = { getChavePublica, inscrever, cancelar, getEstado, testar };
