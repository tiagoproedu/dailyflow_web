// src/utils/companheiro.js
//
// O que a criatura diz. Os números vêm todos do servidor (`companheiroServices.js`);
// aqui só se escolhem as palavras.
//
// A regra que governa cada frase: **a criatura descreve a si mesma, nunca julga você.**
// "Está esperando" é um facto sobre ela. "Você falhou" seria um juízo sobre você — e
// falhar um dia não atrapalha a formação do hábito (Lally), portanto o app estaria a
// discordar dos próprios dados. Ver `docs/engajamento.md` §5, regra 2.

const NOMES_DOS_ESTAGIOS = {
  ovo: 'Ovo',
  filhote: 'Filhote',
  crescendo: 'Crescendo',
  firme: 'Firme',
  completo: 'Completo',
};

// O que cada degrau significa — e todos significam a mesma coisa que os números de
// Lally já significam no resto do app, por isso a explicação é curta e verdadeira.
const SENTIDO_DOS_ESTAGIOS = {
  ovo: 'Choca na primeira vez que você marcar alguma coisa.',
  filhote: 'Cresce até 18 repetições, o piso da faixa em que hábitos ficam automáticos.',
  crescendo: 'A caminho de 66 repetições, a média que Lally mediu.',
  firme: 'Passou dos 66. Daqui em diante é manutenção.',
  completo: 'Passou das 254 repetições — o teto da faixa observada.',
};

export const nomeDoEstagio = (chave) => NOMES_DOS_ESTAGIOS[chave] || 'Ovo';

/**
 * A frase principal: o que a criatura está a fazer, e por causa de quê.
 * @param {object} companheiro - O estado vindo do servidor.
 * @returns {string} Uma frase.
 */
export const falaDoCompanheiro = (companheiro) => {
  if (!companheiro) return '';

  const { humor, nome, repeticoes, diasAtivosNaSemana, janelaDeHumor, diasSemMarcar } = companheiro;
  const ele = nome || 'Ele';

  if (humor === 'novo') {
    return 'Ainda é um ovo. Crie um hábito e ele começa a rachar.';
  }

  if (humor === 'esperando') {
    // Antes da primeira marcação de todas não há nada a lamentar: só falta acontecer.
    if (repeticoes === 0) return 'O ovo está rachando. Falta a primeira marcação.';

    return diasSemMarcar === 1
      ? `${ele} está esperando desde ontem.`
      : `${ele} está esperando há ${diasSemMarcar} dias.`;
  }

  const dias = `${diasAtivosNaSemana} de ${janelaDeHumor} dias`;

  if (humor === 'sonolento') return `${ele} está sonolento: ${dias} nesta semana.`;
  if (humor === 'tranquilo') return `${ele} está tranquilo: ${dias} nesta semana.`;

  return `${ele} está animado: ${dias} nesta semana.`;
};

/**
 * A linha de baixo: o que já foi acumulado, e o que falta para o próximo degrau.
 *
 * Mostrar o que falta é de propósito — um progresso já começado puxa mais que um
 * progresso a zero (Nunes & Drèze, efeito de progresso dotado, `engajamento.md` §1.6).
 *
 * @param {object} companheiro - O estado vindo do servidor.
 * @returns {string|null} A linha, ou null quando ainda não há nada a contar.
 */
export const resumoDoCompanheiro = (companheiro) => {
  if (!companheiro) return null;

  const { repeticoes, estagio } = companheiro;

  if (repeticoes === 0) return null;

  const partes = [`${repeticoes} ${repeticoes === 1 ? 'repetição' : 'repetições'}`];

  // Duas informações, no máximo: numa tela de 360px a terceira custava uma linha
  // inteira. O tempo juntos vive no modal, onde há espaço para ele.
  if (estagio.proximo !== null) {
    partes.push(`faltam ${estagio.proximo - repeticoes} para crescer`);
  }

  return partes.join(' · ');
};

/**
 * Há quanto tempo a criatura tem nome. Só o modal mostra isto.
 * @param {object} companheiro - O estado vindo do servidor.
 * @returns {string|null} Ex.: "Juntos há 23 dias." Null antes do primeiro dia.
 */
export const tempoJuntos = (companheiro) => {
  if (!companheiro || !companheiro.diasJuntos) return null;

  return `Juntos há ${companheiro.diasJuntos} ${companheiro.diasJuntos === 1 ? 'dia' : 'dias'}.`;
};

/**
 * A descrição textual da criatura, para quem usa leitor de tela.
 * A imagem é decorativa sem isto: a forma e a cor são a única pista que ela dá.
 * @param {object} companheiro - O estado vindo do servidor.
 * @returns {string} A descrição.
 */
export const descreverCriatura = (companheiro) => {
  if (!companheiro) return 'Companheiro';

  const estagio = nomeDoEstagio(companheiro.estagio.chave).toLowerCase();

  return `${companheiro.nome || 'Companheiro'}, no estágio ${estagio}, ${companheiro.humor}`;
};

export const sentidoDoEstagio = (chave) => SENTIDO_DOS_ESTAGIOS[chave] || '';

/**
 * A frase de quando a criatura sobe de estágio. É o único momento em que ela muda de
 * forma, e a mudança é irreversível: crescimento não anda para trás.
 * @param {object} companheiro - O estado depois de subir.
 * @returns {string} A frase.
 */
export const falaDeCrescimento = (companheiro) => {
  const ele = companheiro.nome || 'Seu companheiro';

  if (companheiro.estagio.chave === 'filhote') {
    return `O ovo chocou. ${ele} nasceu com a sua primeira marcação.`;
  }

  return `${ele} cresceu: ${companheiro.repeticoes} repetições.`;
};
