// src/utils/celebracao.js
//
// O que o app responde quando você marca um hábito.
//
// Por que isto existe: até agora marcar um hábito não devolvia nada — o número mudava
// e acabou. Um comportamento que não produz consequência percebida não se reforça, e
// o ciclo (gatilho → ação → recompensa) ficava aberto. Ver `docs/engajamento.md` §1.1.
//
// Duas regras governam cada frase daqui:
//
// 1. **A frase varia.** Reforço em razão variável sustenta muito mais o comportamento
//    que a mesma resposta sempre. O que varia é o reconhecimento — não há sorteio,
//    não há prêmio: nada aqui é uma loteria.
// 2. **Nenhum número é inventado.** Todos vêm das estatísticas que o servidor
//    recalculou depois de gravar. Elogio inflacionado para de significar coisa alguma.

// Marcos de sequência que merecem uma frase própria.
const MARCOS_DE_SEQUENCIA = {
  3: 'Três dias seguidos. É aqui que a maioria desiste.',
  7: 'Uma semana inteira.',
  14: 'Duas semanas de pé.',
  21: 'Vinte e um dias.',
  30: 'Trinta dias seguidos.',
  66: '66 dias — a média que Lally mediu para um hábito virar automático.',
  100: 'Cem dias. Isto já não é força de vontade.',
  365: 'Um ano.',
};

// Marcos de repetição total (a faixa de automaticidade de Lally: 18 a 254 dias).
const MARCOS_DE_REPETICAO = {
  18: '18 repetições: o piso da faixa em que hábitos começam a ficar automáticos.',
  254: '254 repetições: o teto da faixa observada. Passou por toda ela.',
};

// O caso comum. Sempre com o número real, sempre em mais de uma forma.
const RECONHECIMENTOS = [
  (n) => `Feito. ${n} dias seguidos.`,
  (n) => `Mais um. Sequência de ${n}.`,
  (n) => `Marcado — ${n} dias.`,
  (n) => `Continua de pé: ${n} dias.`,
  (n) => `Feito de novo. Vão ${n}.`,
];

const escolher = (lista) => lista[Math.floor(Math.random() * lista.length)];

/**
 * Vibra o aparelho, se ele souber vibrar.
 *
 * O retorno tátil chega junto com o toque — é o que liga a ação à consequência. Em
 * desktop e no iOS a API não existe; nesse caso a função simplesmente não faz nada,
 * porque a frase na tela já dá o retorno sozinha.
 *
 * @param {Array<number>} padrao - O padrão de vibração, em ms.
 */
export const vibrar = (padrao) => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

  try {
    navigator.vibrate(padrao);
  } catch {
    // Alguns navegadores recusam vibrar sem interação recente. Não é erro nenhum.
  }
};

export const PADRAO_NORMAL = [14, 30, 14];
export const PADRAO_MARCO = [20, 45, 20, 45, 60];

/**
 * Monta o reconhecimento da marcação de um hábito.
 *
 * @param {object} estatisticas - O que o servidor devolveu: `sequencia`,
 *   `diasRepetidos`, `diasPerdoados` e `consistencia`.
 * @returns {{texto: string, marco: boolean}} A frase e se ela merece destaque.
 */
export const reconhecerMarcacao = (estatisticas) => {
  if (!estatisticas) return { texto: 'Feito.', marco: false };

  const { sequencia, diasRepetidos, diasPerdoados } = estatisticas;

  // Marcos de sequência vêm primeiro: são o momento mais raro.
  if (MARCOS_DE_SEQUENCIA[sequencia]) {
    return { texto: MARCOS_DE_SEQUENCIA[sequencia], marco: true };
  }

  if (MARCOS_DE_REPETICAO[diasRepetidos]) {
    return { texto: MARCOS_DE_REPETICAO[diasRepetidos], marco: true };
  }

  // O primeiro dia nunca pode parecer pouco: é o passo com maior atrito de todos.
  if (diasRepetidos === 1) {
    return { texto: 'Dia 1. O primeiro é o que mais custa.', marco: true };
  }

  // Retomada depois de uma quebra. É o momento de maior abandono em qualquer app de
  // hábito, e por isso o único em que o app fala mais alto (`docs/engajamento.md` §1.10).
  if (sequencia <= 1 && diasRepetidos > 1) {
    return { texto: `De volta. São ${diasRepetidos} dias no total — recomeçar conta.`, marco: true };
  }

  // A tolerância só é mencionada quando de facto salvou a corrente. Serve para a
  // pessoa aprender a regra sem precisar de a ler em lado nenhum.
  if (diasPerdoados > 0) {
    return {
      texto: escolher([
        `Sequência de ${sequencia} dias — a falha da semana não a derrubou.`,
        `Feito. ${sequencia} dias, com uma falha perdoada pelo caminho.`,
      ]),
      marco: false,
    };
  }

  return { texto: escolher(RECONHECIMENTOS)(sequencia), marco: false };
};

/**
 * O texto curto que resume o progresso de um hábito, para ficar ao lado do nome.
 * Devolve null quando ainda não há sequência — nada de exibir "0 dias".
 * @param {object} estatisticas - As estatísticas do hábito.
 * @returns {string|null} Ex.: "12 dias".
 */
export const resumoDaSequencia = (estatisticas) => {
  if (!estatisticas || estatisticas.sequencia < 1) return null;

  return `${estatisticas.sequencia} ${estatisticas.sequencia === 1 ? 'dia' : 'dias'}`;
};

export default reconhecerMarcacao;
