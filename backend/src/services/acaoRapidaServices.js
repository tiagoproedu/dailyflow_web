// Autenticação das ações feitas a partir da própria notificação.
//
// O problema: o service worker precisa de chamar a API sem a pessoa abrir o app, e ele
// não enxerga o `localStorage`, que é onde vive o token de sessão.
//
// A saída óbvia seria copiar o token de sessão para o IndexedDB, onde o service worker
// chega. **Não foi o que se fez**: isso deixaria uma credencial de 30 dias com acesso
// total à conta guardada num sítio que qualquer script da origem lê, e que sobrevive ao
// "sair da conta".
//
// Em vez disso, o próprio lembrete carrega um token que só sabe fazer uma coisa: marcar
// **um** hábito, **num** dia. Ele viaja dentro do payload do push, que é cifrado ponta a
// ponta para as chaves daquele aparelho — não fica mais exposto do que o texto da
// notificação já está. Se vazar, o estrago é marcar um hábito como feito.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ESCOPO = 'marcar-habito';

// Vale o resto do dia com folga. Um lembrete das 08:00 ainda funciona à noite; no dia
// seguinte já não, e nem precisaria — o `dia` embutido barra isso de qualquer forma.
const VALIDADE = '20h';

/**
 * A chave destes tokens é derivada da chave de sessão, mas não é a mesma.
 *
 * Assim um token de ação nunca passa por `protect` (e um token de sessão nunca serve
 * para marcar um hábito): as assinaturas simplesmente não conferem entre si. É
 * separação de credenciais sem precisar de mais uma variável no `.env`.
 *
 * @returns {string} A chave usada para assinar e verificar tokens de ação.
 */
const chave = () =>
    crypto
        .createHmac('sha256', process.env.CHAVE_SECRETA || '')
        .update('acao-rapida-v1')
        .digest('hex');

/**
 * Cria o token que autoriza marcar um hábito específico num dia específico.
 * @param {object} dados - `{ habitId, userId, dia }`, com `dia` no formato "AAAA-MM-DD".
 * @returns {string} O token assinado.
 */
const criarToken = ({ habitId, userId, dia }) =>
    jwt.sign({ escopo: ESCOPO, habitId, userId, dia }, chave(), { expiresIn: VALIDADE });

/**
 * Verifica e abre um token de ação.
 * @param {string} token - O token recebido do service worker.
 * @returns {object} `{ habitId, userId, dia }`.
 * @throws {Error} Se estiver inválido, expirado ou for de outro tipo.
 */
const lerToken = (token) => {
    if (!token || typeof token !== 'string') {
        throw new Error('Ação inválida.');
    }

    let dados;

    try {
        dados = jwt.verify(token, chave());
    } catch (error) {
        throw new Error(error.name === 'TokenExpiredError' ? 'Ação expirada.' : 'Ação inválida.');
    }

    // Cinto e suspensórios: mesmo com a chave separada, o escopo é conferido.
    if (dados.escopo !== ESCOPO || !dados.habitId || !dados.userId || !dados.dia) {
        throw new Error('Ação inválida.');
    }

    return { habitId: dados.habitId, userId: dados.userId, dia: dados.dia };
};

module.exports = { criarToken, lerToken, ESCOPO };
