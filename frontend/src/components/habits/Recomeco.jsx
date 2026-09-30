// src/components/habits/Recomeco.jsx
//
// A tela de recomeço: o que o app diz no dia seguinte a uma quebra.
//
// É o momento de maior abandono em qualquer app de hábito (`docs/engajamento.md` §1.10)
// e até aqui o app respondia a ele com silêncio — a sequência simplesmente sumia da
// tela, como se o histórico todo tivesse sido apagado junto.
//
// Três decisões governam este cartão:
//
// 1. **Não é um velório.** Nenhum vermelho, nenhum "você falhou", nenhuma contagem do
//    que se perdeu. Falhar dias não atrapalha a formação do hábito (Lally et al.) e o
//    app não pode discordar dos dados que ele mesmo mostra.
// 2. **Diz alto o que sobreviveu.** As repetições, o recorde e a consistência não
//    zeraram. Um progresso que já existe puxa muito mais que um progresso do zero
//    (Nunes & Drèze) — e neste caso o progresso é verdadeiro, não um crédito de cortesia.
// 3. **Uma ação, ali mesmo.** O botão marca o hábito sem sair do cartão. Mandar a pessoa
//    procurar o hábito noutra página é acrescentar atrito ao momento com menos vontade.

/**
 * Encontra um marco temporal em que o recomeço se possa apoiar.
 *
 * Dai, Milkman & Riis: datas com significado — segunda-feira, dia 1º, virada de mês —
 * reabrem a disposição de tentar de novo. Quando o dia não é nenhuma delas, o cartão
 * simplesmente não inventa um marco.
 *
 * @param {Date} agora - O dia de hoje.
 * @returns {string|null} A frase do marco, ou null.
 */
const marcoTemporal = (agora = new Date()) => {
  if (agora.getDate() === 1) return 'Hoje é dia 1.';
  if (agora.getDay() === 1) return 'Hoje é segunda-feira.';

  return null;
};

/**
 * Junta o que sobreviveu à quebra numa frase só.
 * @param {Array<object>} habitos - Os hábitos parados, com `estatisticas`.
 * @returns {string} A frase.
 */
const oQueSobreviveu = (habitos) => {
  const repeticoes = habitos.reduce((total, h) => total + h.estatisticas.diasRepetidos, 0);
  const recorde = Math.max(...habitos.map((h) => h.estatisticas.recorde));

  const partes = [`${repeticoes} ${repeticoes === 1 ? 'repetição' : 'repetições'}`];
  if (recorde > 1) partes.push(`um recorde de ${recorde} dias seguidos`);

  return `Nada disso foi apagado: ${partes.join(' e ')} continuam aí.`;
};

function Recomeco({ habitos, aoMarcar, agora = new Date() }) {
  if (!habitos || habitos.length === 0) return null;

  // O título fala do hábito parado há mais tempo: é o número que a pessoa reconhece.
  const maiorParagem = Math.max(...habitos.map((h) => h.estatisticas.recomeco.diasParado));
  const marco = marcoTemporal(agora);

  return (
    <section className="card recomeco" aria-labelledby="titulo-recomeco">
      <h2 className="section-title" id="titulo-recomeco">
        {habitos.length === 1
          ? `Parado há ${maiorParagem} dias.`
          : `${habitos.length} hábitos parados há até ${maiorParagem} dias.`}
      </h2>

      <p className="recomeco-sobreviveu">{oQueSobreviveu(habitos)}</p>

      <ul className="list recomeco-lista">
        {habitos.map((habito) => (
          <li key={habito.id} className="list-item">
            <span className="recomeco-nome">
              {habito.name}
              <span className="texto-apoio">
                {habito.estatisticas.diasRepetidos} repetições
                {habito.estatisticas.recorde > 1 && ` · recorde ${habito.estatisticas.recorde}`}
              </span>
            </span>
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => aoMarcar(habito.id)}
            >
              Fiz hoje
            </button>
          </li>
        ))}
      </ul>

      <p className="texto-apoio recomeco-rodape">
        {marco ? `${marco} ` : ''}
        Marcar hoje começa uma sequência nova — e ela conta a partir de 1.
      </p>
    </section>
  );
}

export default Recomeco;
