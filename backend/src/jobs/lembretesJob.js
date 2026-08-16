const cron = require('node-cron');
const {PrismaClient} = require('@prisma/client');
const PushServices = require('../services/pushServices');
const StreakServices = require('../services/streakServices');

const prisma = new PrismaClient();

const FUSO = process.env.TZ || 'America/Fortaleza';

/**
 * A hora local no formato "HH:MM", que é como o `cueTime` do hábito está guardado.
 * @param {Date} agora - O instante a formatar.
 * @returns {string} A hora, ex.: "08:00".
 */
const horaLocal = (agora) =>
    `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

/**
 * Monta o texto da notificação a partir dos hábitos pendentes de um utilizador.
 *
 * A frase segue a intenção de implementação ("quando eu X, então eu vou Y"), que é a
 * estrutura que o app usa para formar hábitos — não um "abra o app" genérico.
 *
 * A sequência entra aqui de propósito: é no momento do lembrete que ela tem efeito,
 * porque é aí que existe algo a perder. Entra como facto, nunca como ameaça — falhar
 * um dia não estraga o hábito (ver `docs/gamificacao.md`).
 *
 * @param {Array<object>} habitos - Os hábitos a lembrar, já com `estatisticas`.
 * @returns {object} O conteúdo pronto para o push.
 */
const montarConteudo = (habitos) => {
    if (habitos.length === 1) {
        const [habito] = habitos;
        const sequencia = habito.estatisticas ? habito.estatisticas.sequencia : 0;

        const base = habito.cue
            ? `Você combinou: quando ${habito.cue}.`
            : 'Marque assim que fizer.';

        // Abaixo de dois dias não há corrente nenhuma para mencionar.
        return {
            titulo: `Hora de: ${habito.name}`,
            corpo: sequencia >= 2 ? `${base} Sequência de ${sequencia} dias.` : base,
        };
    }

    return {
        titulo: `${habitos.length} hábitos agora`,
        corpo: habitos.map((habito) => habito.name).join(' · '),
    };
};

/**
 * Procura os hábitos cujo horário de gatilho é agora e avisa quem ainda não os marcou.
 *
 * Hábito já concluído hoje não gera lembrete: avisar sobre algo que a pessoa já fez é a
 * forma mais rápida de ela aprender a ignorar as notificações.
 *
 * @param {Date} [agora] - Instante a considerar (injetável para teste).
 * @returns {Promise<{hora: string, utilizadores: number, enviadas: number}>} O que foi feito.
 */
const dispararLembretesDe = async (agora = new Date()) => {
    const hora = horaLocal(agora);

    // O histórico inteiro vem junto porque a notificação cita a sequência. São poucos
    // hábitos por minuto (só os que têm este `cueTime` exato), então sai barato.
    const habitos = await prisma.habit.findMany({
        where: { cueTime: hora },
        include: { completions: true },
    });

    // Sobram os que ainda não foram marcados hoje.
    const pendentes = habitos
        .map((habito) => ({
            ...habito,
            estatisticas: StreakServices.calcularEstatisticas(habito, agora),
        }))
        .filter((habito) => !habito.estatisticas.feitoHoje);

    if (pendentes.length === 0) {
        return { hora, utilizadores: 0, enviadas: 0 };
    }

    // Dois hábitos no mesmo horário viram uma notificação só, não duas vibrações.
    const porUtilizador = new Map();

    pendentes.forEach((habito) => {
        const lista = porUtilizador.get(habito.userId) || [];
        lista.push(habito);
        porUtilizador.set(habito.userId, lista);
    });

    let enviadas = 0;

    await Promise.all(
        Array.from(porUtilizador.entries()).map(async ([userId, lista]) => {
            const resultado = await PushServices.enviarParaUtilizador(userId, {
                ...montarConteudo(lista),
                url: '/dashboard',
                // A tag faz a notificação nova substituir a anterior da mesma hora,
                // em vez de empilhar se o servidor reiniciar.
                tag: `habitos-${hora}`,
            });
            enviadas += resultado.enviadas;
        })
    );

    return { hora, utilizadores: porUtilizador.size, enviadas };
};

/**
 * Liga a verificação de minuto a minuto.
 * @returns {object|null} A tarefa agendada, ou null se os lembretes estiverem desligados.
 */
const iniciarLembretes = () => {
    if (!PushServices.estaConfigurado()) {
        console.warn('[lembretes] sem chaves VAPID: agendador não foi ligado.');
        return null;
    }

    const tarefa = cron.schedule(
        '* * * * *',
        async () => {
            try {
                const resultado = await dispararLembretesDe();

                if (resultado.enviadas > 0) {
                    console.log(`[lembretes] ${resultado.hora}: ${resultado.enviadas} notificação(ões) enviada(s).`);
                }
            } catch (error) {
                // Uma falha num minuto não pode derrubar o agendador dos minutos seguintes.
                console.error('[lembretes] falha ao processar o minuto:', error);
            }
        },
        { timezone: FUSO }
    );

    console.log(`[lembretes] agendador ligado (fuso ${FUSO}).`);
    return tarefa;
};

module.exports = { iniciarLembretes, dispararLembretesDe, montarConteudo, horaLocal };
