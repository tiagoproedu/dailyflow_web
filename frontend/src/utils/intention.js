// src/utils/intention.js
//
// Monta a frase da "intenção de implementação" do hábito.
// O formato "quando X, então Y" liga um gatilho concreto a uma ação e é a
// intervenção com melhor suporte científico para formação de hábitos.
// Ver docs/gamificacao.md.

/**
 * Monta a frase do gatilho de um hábito.
 * @param {object} habit - O hábito, com os campos `name`, `cue` e `cueTime`.
 * @returns {string|null} A frase pronta, ou null se o hábito ainda não tem gatilho.
 */
export const buildIntention = (habit) => {
  if (!habit) return null;

  const { name, cue, cueTime } = habit;

  if (cue && cueTime) {
    return `Quando eu ${cue} (por volta das ${cueTime}), então eu vou ${name}.`;
  }

  if (cue) {
    return `Quando eu ${cue}, então eu vou ${name}.`;
  }

  if (cueTime) {
    return `Às ${cueTime}, eu vou ${name}.`;
  }

  return null;
};

export default buildIntention;
