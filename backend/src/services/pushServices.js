const webpush = require('web-push');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// As chaves VAPID identificam este servidor perante o serviço de push do navegador.
// Sem elas o envio não funciona, mas o resto do app tem de continuar de pé — por isso
// aqui só se regista o aviso, em vez de derrubar o processo.
const configurado = Boolean(process.env.VAPID_PUBLICA && process.env.VAPID_PRIVADA);

if (configurado) {
    webpush.setVapidDetails(
        process.env.VAPID_CONTATO || 'mailto:sem-contacto@dailyflow.local',
        process.env.VAPID_PUBLICA,
        process.env.VAPID_PRIVADA
    );
} else {
    console.warn('[push] VAPID_PUBLICA/VAPID_PRIVADA em falta: lembretes desligados.');
}

/**
 * A chave pública que o navegador precisa para criar uma inscrição.
 * @returns {string|null} A chave, ou null se o servidor não tiver VAPID configurado.
 */
const getChavePublica = () => (configurado ? process.env.VAPID_PUBLICA : null);

/**
 * Guarda (ou reaproveita) a inscrição de um aparelho.
 *
 * A chave única é o endpoint: o mesmo utilizador pode ter celular e desktop, e o
 * mesmo aparelho pode reinscrever-se depois de o navegador rodar as chaves.
 *
 * @param {string} userId - O ID do utilizador.
 * @param {object} inscricao - O objeto PushSubscription vindo do navegador.
 * @returns {Promise<object>} A inscrição guardada.
 */
const inscrever = async (userId, inscricao) => {
    const { endpoint, keys } = inscricao || {};

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new Error('Inscrição inválida.');
    }

    return prisma.pushSubscription.upsert({
        where: { endpoint },
        // Se o aparelho já existia noutra conta, passa a pertencer a quem se inscreveu agora.
        update: { userId, p256dh: keys.p256dh, auth: keys.auth },
        create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });
};

/**
 * Remove a inscrição de um aparelho.
 * @param {string} userId - O ID do utilizador.
 * @param {string} endpoint - O endpoint a remover.
 * @returns {Promise<number>} Quantas inscrições foram removidas.
 */
const cancelar = async (userId, endpoint) => {
    if (!endpoint) {
        throw new Error('Inscrição inválida.');
    }

    const { count } = await prisma.pushSubscription.deleteMany({
        where: { userId, endpoint },
    });

    return count;
};

/**
 * Diz se o utilizador tem pelo menos um aparelho a receber lembretes.
 * @param {string} userId - O ID do utilizador.
 * @returns {Promise<number>} Quantidade de aparelhos inscritos.
 */
const contarAparelhos = (userId) => prisma.pushSubscription.count({ where: { userId } });

/**
 * Envia uma notificação para todos os aparelhos do utilizador.
 *
 * Inscrição que o serviço de push rejeita como morta (404/410) é apagada: o aparelho
 * desinstalou o app ou limpou os dados, e insistir nela só gera erro para sempre.
 *
 * @param {string} userId - O ID do utilizador.
 * @param {object} conteudo - `{ titulo, corpo, url, tag }`.
 * @returns {Promise<{enviadas: number, removidas: number}>} O resultado do envio.
 */
const enviarParaUtilizador = async (userId, conteudo) => {
    if (!configurado) {
        return { enviadas: 0, removidas: 0 };
    }

    const inscricoes = await prisma.pushSubscription.findMany({ where: { userId } });
    const payload = JSON.stringify(conteudo);

    let enviadas = 0;
    const mortas = [];

    await Promise.all(
        inscricoes.map(async (inscricao) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: inscricao.endpoint,
                        keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
                    },
                    payload
                );
                enviadas += 1;
            } catch (error) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    mortas.push(inscricao.endpoint);
                } else {
                    console.error(`[push] falha ao enviar para ${inscricao.endpoint}:`, error.statusCode || error.message);
                }
            }
        })
    );

    if (mortas.length > 0) {
        await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: mortas } } });
    }

    return { enviadas, removidas: mortas.length };
};

module.exports = {
    getChavePublica,
    inscrever,
    cancelar,
    contarAparelhos,
    enviarParaUtilizador,
    estaConfigurado: () => configurado,
};
