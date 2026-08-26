// O companheiro: uma criatura que acompanha o utilizador e reage ao que ele faz.
//
// Por que existe: o app fecha o ciclo de cada hábito, um a um, mas nada no app é *do*
// utilizador. Abrir o DailyFlow era abrir listas. Um personagem com nome dá à pessoa
// algo que ela reconhece e que acumula história — o quarto passo do modelo de Eyal,
// o investimento (`docs/engajamento.md` §1.9).
//
// Três regras que separam isto do Habitica, e que **não podem ser quebradas**:
//
// 1. **A criatura nunca sofre.** No Habitica o avatar leva dano quando você falha. Aqui
//    não há dano, doença nem morte: falhar um dia não atrapalha a formação do hábito
//    (Lally et al.), e o app não pode discordar dos dados. Quando o utilizador some, a
//    criatura **espera** — não adoece.
// 2. **O crescimento não anda para trás.** É o que torna o investimento seguro de fazer.
//    O humor varia com a semana; o estágio, não.
// 3. **Não se interage com ela.** Não há alimentar, vestir, equipar nem loja. Qualquer
//    coisa dessas seria um jogo *dentro* do app, e a regra 3 de `engajamento.md` proíbe
//    mecânicas que aumentem o tempo de sessão. Ela mostra estado; quem age, age na vida.
//
// Tudo aqui é derivado das conclusões reais. Só o nome e a data de batismo são guardados.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DIA_MS = 24 * 60 * 60 * 1000;

// A janela em que o humor é lido. Uma semana é curta o bastante para responder ao que
// está a acontecer agora e longa o bastante para um dia ruim não virar tudo.
const JANELA_DE_HUMOR = 7;

// Os degraus são os números de Lally que o resto do app já usa (`streakServices.js`):
// 18 é o piso da faixa em que hábitos ficam automáticos, 66 a média, 254 o teto.
// Assim o crescimento da criatura não é uma escala inventada — é a mesma régua.
const ESTAGIOS = [
    { chave: 'ovo', minimo: 0 },
    { chave: 'filhote', minimo: 1 },
    { chave: 'crescendo', minimo: 18 },
    { chave: 'firme', minimo: 66 },
    { chave: 'completo', minimo: 254 },
];

/**
 * Descobre em que degrau um total de repetições cai.
 * @param {number} repeticoes - Quantas vezes o utilizador marcou algo, ao todo.
 * @returns {{chave: string, indice: number, minimo: number, proximo: number|null}} O estágio.
 */
const estagioPara = (repeticoes) => {
    let indice = 0;

    for (let i = 0; i < ESTAGIOS.length; i++) {
        if (repeticoes >= ESTAGIOS[i].minimo) indice = i;
    }

    const seguinte = ESTAGIOS[indice + 1];

    return {
        chave: ESTAGIOS[indice].chave,
        indice,
        minimo: ESTAGIOS[indice].minimo,
        proximo: seguinte ? seguinte.minimo : null,
    };
};

/**
 * Traduz a semana recente num humor.
 *
 * Repare no que **não** está aqui: nenhum estado negativo. O pior caso é "esperando",
 * que descreve a criatura, não o utilizador. "Você falhou" não é um humor, é um juízo.
 *
 * @param {boolean} temHabitos - Se já existe algum hábito.
 * @param {number} diasAtivos - Quantos dos últimos 7 dias tiveram pelo menos uma marcação.
 * @returns {string} 'novo', 'esperando', 'sonolento', 'tranquilo' ou 'animado'.
 */
const humorPara = (temHabitos, diasAtivos) => {
    if (!temHabitos) return 'novo';
    if (diasAtivos === 0) return 'esperando';
    if (diasAtivos <= 2) return 'sonolento';
    if (diasAtivos <= 5) return 'tranquilo';

    return 'animado';
};

// Um `Date` qualquer vira a chave "AAAA-MM-DD" do dia local e, daí, ms UTC — a mesma
// convenção de `streakServices.js`, para os dois nunca discordarem sobre que dia é hoje.
const diaLocalEmMs = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return Date.parse(`${ano}-${mes}-${dia}T00:00:00.000Z`);
};

/**
 * Reúne o estado do companheiro a partir dos hábitos e das conclusões reais.
 *
 * @param {object} utilizador - O utilizador, com `companheiroNome` e `companheiroDesde`.
 * @param {Array<object>} habitos - Os hábitos com as suas `completions`.
 * @param {Date} agora - O instante de referência (injetável para testes).
 * @returns {object} O estado da criatura.
 */
const estadoDoCompanheiro = (utilizador, habitos, agora = new Date()) => {
    const hojeMs = diaLocalEmMs(agora);

    const dias = new Set();
    let repeticoes = 0;

    for (const habito of habitos) {
        for (const conclusao of habito.completions || []) {
            // `@db.Date` volta como meia-noite UTC: ler em UTC é o que dá o dia certo.
            dias.add(new Date(conclusao.date).toISOString().slice(0, 10));
            repeticoes++;
        }
    }

    let diasAtivosNaSemana = 0;

    for (let i = 0; i < JANELA_DE_HUMOR; i++) {
        const chave = new Date(hojeMs - i * DIA_MS).toISOString().slice(0, 10);
        if (dias.has(chave)) diasAtivosNaSemana++;
    }

    const ultimaMarcacao = dias.size > 0 ? [...dias].sort().pop() : null;
    const diasSemMarcar = ultimaMarcacao
        ? Math.floor((hojeMs - Date.parse(`${ultimaMarcacao}T00:00:00.000Z`)) / DIA_MS)
        : null;

    const desde = utilizador.companheiroDesde || null;

    return {
        nome: utilizador.companheiroNome || null,
        desde,
        // Conta desde o batismo, não desde a criação da conta: o tempo junto começa
        // quando a pessoa deu um nome — foi esse o gesto dela.
        diasJuntos: desde
            ? Math.max(0, Math.floor((hojeMs - diaLocalEmMs(new Date(desde))) / DIA_MS))
            : null,
        estagio: estagioPara(repeticoes),
        repeticoes,
        diasAtivosNaSemana,
        janelaDeHumor: JANELA_DE_HUMOR,
        ultimaMarcacao,
        diasSemMarcar,
        humor: humorPara(habitos.length > 0, diasAtivosNaSemana),
        temHabitos: habitos.length > 0,
    };
};

// Curto de propósito: o nome vive ao lado da criatura numa tela de 360px, e nada disto
// é um formulário — é um gesto de um campo só.
const LIMITE_DO_NOME = 24;

/**
 * Batiza (ou rebatiza) o companheiro.
 *
 * A data do batismo só é gravada uma vez: rebatizar não reinicia o tempo juntos, porque
 * o tempo juntos não foi o nome que o produziu.
 *
 * @param {string} userId - O ID do utilizador.
 * @param {string} nome - O nome escolhido.
 * @returns {Promise<{nome: string, desde: Date}>} O batismo gravado.
 */
const batizar = async (userId, nome) => {
    const limpo = typeof nome === 'string' ? nome.trim() : '';

    if (!limpo) throw new Error('O companheiro precisa de um nome.');
    if (limpo.length > LIMITE_DO_NOME) {
        throw new Error(`O nome não pode passar de ${LIMITE_DO_NOME} caracteres.`);
    }

    const utilizador = await prisma.user.findUnique({
        where: { id: userId },
        select: { companheiroDesde: true },
    });

    if (!utilizador) throw new Error('Utilizador não encontrado.');

    const atualizado = await prisma.user.update({
        where: { id: userId },
        data: {
            companheiroNome: limpo,
            companheiroDesde: utilizador.companheiroDesde || new Date(),
        },
        select: { companheiroNome: true, companheiroDesde: true },
    });

    return { nome: atualizado.companheiroNome, desde: atualizado.companheiroDesde };
};

module.exports = { estadoDoCompanheiro, batizar, ESTAGIOS, JANELA_DE_HUMOR, LIMITE_DO_NOME };
