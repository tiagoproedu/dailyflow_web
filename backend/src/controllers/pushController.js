const PushServices = require('../services/pushServices');
const AcaoRapidaServices = require('../services/acaoRapidaServices');
const HabitServices = require('../services/habitServices');

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

/**
 * Marca um hábito a partir do botão da própria notificação.
 *
 * Esta rota **não** passa pelo `protect`: quem chama é o service worker, que não tem o
 * token de sessão. A autorização vem do token de ação que veio dentro do lembrete e que
 * só serve para marcar aquele hábito naquele dia (ver `acaoRapidaServices.js`).
 */
const marcar = async (req, res) => {
    let acao;

    try {
        acao = AcaoRapidaServices.lerToken(req.body?.token);
    } catch (error) {
        // 401: o problema é a credencial, não o pedido.
        return res.status(401).json({ error: error.message });
    }

    try {
        const resultado = await HabitServices.marcarHabitoNoDia(acao.habitId, acao.userId, acao.dia);
        return res.status(200).json(resultado);
    } catch (error) {
        if (error.message === 'Este lembrete é de outro dia.') {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        console.error('Erro ao marcar hábito pela notificação:', error);
        return res.status(500).json({ error: 'Não foi possível marcar o hábito.' });
    }
};

module.exports = { getChavePublica, inscrever, cancelar, getEstado, testar, marcar };
