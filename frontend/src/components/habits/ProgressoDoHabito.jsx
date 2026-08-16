// src/components/habits/ProgressoDoHabito.jsx
//
// A barra de automaticidade e a consistência recente de um hábito.
//
// A consistência anda sempre colada à sequência de propósito: uma falha derruba a
// sequência a zero mas quase não mexe nos 30 dias. É o número que impede o app de
// dar a entender que um dia ruim apagou o mês inteiro (`docs/gamificacao.md` §3.2).

function ProgressoDoHabito({ estatisticas }) {
  if (!estatisticas || estatisticas.diasRepetidos === 0) return null;

  const { diasRepetidos, automaticidade, consistencia, recorde } = estatisticas;
  const percentual = Math.min(100, Math.round((diasRepetidos / automaticidade.media) * 100));

  return (
    <div className="habit-progresso">
      {/* Decorativa: a legenda logo abaixo diz os mesmos números por extenso. */}
      <div className="progresso progresso-fino" aria-hidden="true">
        <div className="progresso-preenchido" style={{ width: `${percentual}%` }} />
      </div>

      {/* Curto de propósito: numa tela de 360px cada palavra a mais vira uma linha
          a mais, e a legenda repetia-se em cada hábito da lista. */}
      <p className="habit-progresso-legenda">
        <strong>{diasRepetidos}</strong>/{automaticidade.media} repetições
        {consistencia && (
          <>
            {' · '}
            <strong>{consistencia.percentual}%</strong> em {consistencia.diasConsiderados}d
          </>
        )}
        {recorde > 1 && <>{' · '}recorde {recorde}</>}
      </p>
    </div>
  );
}

export default ProgressoDoHabito;
