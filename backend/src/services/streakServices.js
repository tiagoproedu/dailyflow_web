// Sequência, consistência e automaticidade de um hábito.
//
// Tudo aqui é **derivado das conclusões**, nunca guardado. Guardar um contador é
// convidar a divergência: basta apagar uma conclusão antiga para o número virar
// mentira, e a regra do projeto é que nada aparece na tela sem estar ligado ao banco.
//
// As decisões de desenho estão em `docs/gamificacao.md` e `docs/engajamento.md`:
// falhar um único dia não atrapalha a formação do hábito (Lally et al., 2009), logo
// a sequência não pode zerar na primeira falha.

const DIA_MS = 24 * 60 * 60 * 1000;

// Trava de segurança: nenhum passeio pelo histórico anda mais que isto.
const LIMITE_DE_DIAS = 800;

// Média de Lally et al. para um hábito virar automático, e a faixa real observada.
const AUTOMATICIDADE = { media: 66, minimo: 18, maximo: 254 };

const JANELA_DE_CONSISTENCIA = 30;

/**
 * Chave "AAAA-MM-DD" de uma conclusão vinda do banco.
 * `HabitCompletion.date` é `@db.Date`, então o Prisma devolve meia-noite **UTC**.
 * Ler com `getDate()` num fuso negativo daria o dia anterior — por isso, UTC.
 * @param {Date|string} data - A data da conclusão.
 * @returns {string} A chave do dia.
 */
const chaveDeConclusao = (data) => new Date(data).toISOString().slice(0, 10);

/**
 * Chave "AAAA-MM-DD" do dia em que o utilizador está agora.
 * Aqui é hora **local** de propósito: o fuso do processo é America/Fortaleza
 * (ver CLAUDE.md), e "hoje" é o dia dele, não o de Greenwich.
 * @param {Date} agora - O instante de referência.
 * @returns {string} A chave do dia.
 */
const chaveDeHoje = (agora = new Date()) => {
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
};

// Dentro dos cálculos os dias andam em UTC puro. Assim somar e subtrair um dia é
// sempre exatamente 86.400.000 ms, sem horário de verão para atrapalhar.
const chaveParaMs = (chave) => Date.parse(`${chave}T00:00:00.000Z`);
const msParaChave = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * Identifica a semana (começando na segunda-feira) a que um dia pertence.
 * É o período em que a tolerância de uma falha é contada.
 * @param {number} ms - O dia, em ms UTC.
 * @returns {string} A chave da segunda-feira daquela semana.
 */
const chaveDaSemana = (ms) => {
    const diaDaSemana = (new Date(ms).getUTCDay() + 6) % 7; // 0 = segunda

    return msParaChave(ms - diaDaSemana * DIA_MS);
};

/**
 * Anda para trás no calendário contando os dias feitos.
 *
 * Regra da tolerância: **uma falha grátis por semana**. A falha só é perdoada se o
 * dia anterior a ela foi feito — duas ausências seguidas encerram a sequência, por
 * mais tolerância que ainda houvesse.
 *
 * A sequência devolvida conta apenas dias **realmente feitos**: o dia perdoado
 * mantém a corrente viva mas não entra na contagem. O número na tela continua a ser
 * um facto.
 *
 * Quem trava o passeio é o primeiro dia em falta, não a data de criação do hábito: uma
 * conclusão anterior ao `createdAt` (dado importado, por exemplo) tem de contar como
 * qualquer outra. O `LIMITE_DE_DIAS` é que garante que o ciclo termina.
 *
 * @param {Set<string>} feitos - Chaves dos dias concluídos.
 * @param {number} hojeMs - O dia de hoje, em ms UTC.
 * @returns {{sequencia: number, diasPerdoados: number}} A sequência atual.
 */
const calcularSequencia = (feitos, hojeMs) => {
    // O dia de hoje ainda está a correr: não ter marcado ainda não é ter falhado.
    let cursor = feitos.has(msParaChave(hojeMs)) ? hojeMs : hojeMs - DIA_MS;

    const semanasPerdoadas = new Set();
    let sequencia = 0;

    for (let passo = 0; passo < LIMITE_DE_DIAS; passo++) {
        if (feitos.has(msParaChave(cursor))) {
            sequencia++;
            cursor -= DIA_MS;
            continue;
        }

        // Falhou neste dia. Só há perdão se a semana ainda não gastou o dela...
        const semana = chaveDaSemana(cursor);
        if (semanasPerdoadas.has(semana)) break;

        // ...e se o dia anterior foi feito. Duas faltas seguidas quebram mesmo.
        if (!feitos.has(msParaChave(cursor - DIA_MS))) break;

        semanasPerdoadas.add(semana);
        cursor -= DIA_MS;
    }

    return { sequencia, diasPerdoados: semanasPerdoadas.size };
};

/**
 * O maior número de dias seguidos já feito, sem tolerância.
 * É um recorde histórico, por isso conta só dias reais e encostados.
 * @param {Array<string>} chavesOrdenadas - As chaves dos dias feitos, em ordem crescente.
 * @returns {number} O recorde.
 */
const calcularRecorde = (chavesOrdenadas) => {
    let recorde = 0;
    let corrente = 0;
    let anterior = null;

    for (const chave of chavesOrdenadas) {
        const ms = chaveParaMs(chave);
        corrente = anterior !== null && ms - anterior === DIA_MS ? corrente + 1 : 1;
        recorde = Math.max(recorde, corrente);
        anterior = ms;
    }

    return recorde;
};

/**
 * Percentagem de dias feitos na janela recente.
 *
 * Existe para acompanhar a sequência: uma falha derruba a sequência a zero mas quase
 * não mexe nos 30 dias. É o número que diz a verdade num dia ruim.
 *
 * A janela termina **ontem** enquanto hoje não estiver marcado — senão o hábito
 * pareceria pior de manhã só por o dia ainda não ter acontecido.
 *
 * @param {Set<string>} feitos - Chaves dos dias concluídos.
 * @param {number} hojeMs - O dia de hoje, em ms UTC.
 * @param {number} inicioMs - O dia em que o hábito foi criado, em ms UTC.
 * @returns {{percentual: number, diasFeitos: number, diasConsiderados: number}|null}
 *   Null quando ainda não há um único dia fechado para medir.
 */
const calcularConsistencia = (feitos, hojeMs, inicioMs) => {
    const fimMs = feitos.has(msParaChave(hojeMs)) ? hojeMs : hojeMs - DIA_MS;
    const diasDeVida = Math.floor((fimMs - inicioMs) / DIA_MS) + 1;

    if (diasDeVida < 1) return null;

    const diasConsiderados = Math.min(JANELA_DE_CONSISTENCIA, diasDeVida);
    let diasFeitos = 0;

    for (let i = 0; i < diasConsiderados; i++) {
        if (feitos.has(msParaChave(fimMs - i * DIA_MS))) diasFeitos++;
    }

    return {
        percentual: Math.round((diasFeitos / diasConsiderados) * 100),
        diasFeitos,
        diasConsiderados,
    };
};

/**
 * Descreve uma quebra em curso: o hábito já teve dias feitos e hoje está parado.
 *
 * Existe porque o dia seguinte a uma quebra é o momento de maior abandono em qualquer
 * app de hábito (`docs/engajamento.md` §1.10), e até agora o app respondia a ele com
 * silêncio — o número simplesmente sumia da tela.
 *
 * Quem decide se houve quebra é quem chama: só entra aqui com a sequência em zero. E
 * zero, com a tolerância de uma falha por semana, já significa duas ausências seguidas —
 * a primeira falha depois de um dia feito é sempre perdoada. Por isso um recomeço nunca
 * aparece com menos de três dias desde a última marcação, e nunca no dia que ainda corre.
 *
 * @param {Set<string>} feitos - Chaves dos dias concluídos.
 * @param {number} hojeMs - O dia de hoje, em ms UTC.
 * @returns {{diasParado: number, ultimoDia: string}|null} Null quando nunca se marcou nada.
 */
const calcularRecomeco = (feitos, hojeMs) => {
    // Quem nunca marcou não recomeçou coisa nenhuma: está a começar, que é outra tela.
    if (feitos.size === 0) return null;

    const ultimoDia = [...feitos].sort().pop();

    return {
        diasParado: Math.floor((hojeMs - chaveParaMs(ultimoDia)) / DIA_MS),
        ultimoDia,
    };
};

/**
 * Reúne tudo o que a tela mostra sobre o progresso de um hábito.
 * @param {object} habito - O hábito, com `createdAt` e `completions`.
 * @param {Date} agora - O instante de referência (injetável para testes).
 * @returns {object} Sequência, recorde, consistência, repetições e o estado de hoje.
 */
const calcularEstatisticas = (habito, agora = new Date()) => {
    const conclusoes = habito.completions || [];
    const chaves = conclusoes.map((conclusao) => chaveDeConclusao(conclusao.date));
    const feitos = new Set(chaves);

    const hojeChave = chaveDeHoje(agora);
    const hojeMs = chaveParaMs(hojeChave);

    // A idade do hábito só entra na consistência: um hábito de 3 dias não pode ser
    // julgado por uma janela de 30. A sequência não precisa dela — ver acima.
    const inicioMs = Math.min(
        chaveParaMs(chaveDeHoje(new Date(habito.createdAt))),
        hojeMs
    );

    const { sequencia, diasPerdoados } = calcularSequencia(feitos, hojeMs);

    // A quebra só é uma quebra se a corrente caiu mesmo. Um hábito com sequência viva
    // nunca mostra tela de recomeço, por mais antiga que seja a última falha.
    const recomeco = sequencia === 0 ? calcularRecomeco(feitos, hojeMs) : null;

    return {
        sequencia,
        diasPerdoados,
        recomeco,
        recorde: Math.max(calcularRecorde([...feitos].sort()), sequencia),
        consistencia: calcularConsistencia(feitos, hojeMs, inicioMs),
        diasRepetidos: feitos.size,
        automaticidade: AUTOMATICIDADE,
        feitoHoje: feitos.has(hojeChave),
    };
};

module.exports = {
    calcularEstatisticas,
    chaveDeConclusao,
    chaveDeHoje,
    AUTOMATICIDADE,
    JANELA_DE_CONSISTENCIA,
};
