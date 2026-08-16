// src/components/ui/Celebracao.jsx
//
// A resposta do app no instante em que um hábito é marcado.
//
// O contentor com `role="status"` fica **sempre** no DOM, mesmo vazio: leitor de tela
// só anuncia mudanças dentro de uma região viva. Se a região aparecesse junto com a
// frase, a frase não seria lida.

import { useEffect, useRef } from 'react';

const DURACAO_NORMAL = 2600;
const DURACAO_MARCO = 4200;

function Celebracao({ mensagem, aoFechar }) {
  // O callback vive numa ref para o temporizador não reiniciar a cada render do pai —
  // senão uma frase podia ficar na tela indefinidamente.
  const fecharRef = useRef(aoFechar);
  fecharRef.current = aoFechar;

  const id = mensagem ? mensagem.id : null;
  const eMarco = Boolean(mensagem && mensagem.marco);

  useEffect(() => {
    if (id === null) return undefined;

    const temporizador = setTimeout(
      () => fecharRef.current(),
      eMarco ? DURACAO_MARCO : DURACAO_NORMAL
    );

    return () => clearTimeout(temporizador);
  }, [id, eMarco]);

  return (
    <div className="celebracao-area" role="status">
      {mensagem && (
        // A `key` muda a cada marcação para a animação recomeçar mesmo quando a
        // frase sorteada calha ser a mesma de antes.
        <p key={mensagem.id} className={`celebracao ${eMarco ? 'celebracao-marco' : ''}`}>
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}

export default Celebracao;
