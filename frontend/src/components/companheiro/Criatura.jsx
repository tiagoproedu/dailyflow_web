// src/components/companheiro/Criatura.jsx
//
// O desenho da criatura. Duas entradas mandam nele, e nada mais:
//
// - **o estágio** decide o corpo, e só cresce (`companheiroServices.js`, regra 2);
// - **o humor** decide os olhos e a boca, e esse sim vai e volta com a semana.
//
// Não há estado triste, doente ou ferido — de propósito. O pior humor é "esperando",
// que é a criatura parada de olhos abertos, não um bicho a sofrer.
//
// É `aria-hidden`: quem lê a tela por voz recebe a mesma informação em palavras, na
// frase ao lado. Repetir aqui só faria o leitor dizer tudo duas vezes.

import { useId } from 'react';

// Cada degrau é um corpo maior. Os números são medidas do desenho, não da regra —
// a régua (0, 1, 18, 66, 254 repetições) vive no serviço.
const CORPOS = {
  filhote: { rx: 13, ry: 12, cy: 42 },
  crescendo: { rx: 15.5, ry: 14.5, cy: 41 },
  firme: { rx: 17.5, ry: 16.5, cy: 40 },
  completo: { rx: 19, ry: 18, cy: 39 },
};

const ORDEM = ['ovo', 'filhote', 'crescendo', 'firme', 'completo'];

/**
 * Os olhos, conforme o humor.
 * @param {string} humor - O humor vindo do servidor.
 * @param {number} x - Centro horizontal do olho.
 * @param {number} y - Centro vertical do olho.
 * @param {number} r - O raio.
 * @returns {JSX.Element} O olho.
 */
function Olho({ humor, x, y, r }) {
  // Sonolento: pálpebra caída, um arco em vez do círculo cheio.
  if (humor === 'sonolento') {
    return (
      <path
        d={`M ${x - r} ${y} a ${r} ${r} 0 0 1 ${r * 2} 0`}
        fill="none"
        stroke="var(--neutral-gray-darker)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    );
  }

  // Animado: o olho vira um arco para cima, que é como um sorriso se lê num olho.
  if (humor === 'animado') {
    return (
      <path
        d={`M ${x - r} ${y + r * 0.4} a ${r} ${r} 0 0 1 ${r * 2} 0`}
        fill="none"
        stroke="var(--neutral-gray-darker)"
        strokeWidth="1.8"
        strokeLinecap="round"
        transform={`rotate(180 ${x} ${y + r * 0.4})`}
      />
    );
  }

  return (
    <>
      <circle cx={x} cy={y} r={r} fill="var(--neutral-gray-darker)" />
      <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#FFFFFF" />
    </>
  );
}

/**
 * A boca, conforme o humor.
 * @param {string} humor - O humor vindo do servidor.
 * @param {number} cx - Centro horizontal.
 * @param {number} y - Altura da boca.
 * @returns {JSX.Element} A boca.
 */
function Boca({ humor, cx, y }) {
  if (humor === 'esperando') {
    return <circle cx={cx} cy={y} r="1.6" fill="var(--neutral-gray-darker)" opacity="0.65" />;
  }

  if (humor === 'sonolento') {
    return (
      <line
        x1={cx - 2.5} y1={y} x2={cx + 2.5} y2={y}
        stroke="var(--neutral-gray-darker)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"
      />
    );
  }

  const largura = humor === 'animado' ? 5 : 3.5;

  return (
    <path
      d={`M ${cx - largura} ${y} q ${largura} ${largura * 0.85} ${largura * 2} 0`}
      fill="none"
      stroke="var(--neutral-gray-darker)"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.75"
    />
  );
}

function Criatura({ estagio, humor, temHabitos, tamanho = 56 }) {
  const idGradiente = useId();
  const indice = ORDEM.indexOf(estagio);

  const comum = {
    width: tamanho,
    height: tamanho,
    viewBox: '0 0 64 64',
    'aria-hidden': 'true',
    focusable: 'false',
    className: `criatura criatura-${estagio} criatura-${humor}`,
  };

  const gradiente = (
    <defs>
      <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--primary-blue)" />
        <stop offset="100%" stopColor="var(--primary-purple-medium)" />
      </linearGradient>
    </defs>
  );

  // ── Ovo ───────────────────────────────────────────────────────────────────
  if (indice <= 0) {
    return (
      <svg {...comum}>
        {gradiente}
        <path
          d="M32 8c10 0 18 14 18 28 0 12-8 20-18 20s-18-8-18-20C14 22 22 8 32 8z"
          fill={`url(#${idGradiente})`}
        />
        {/* A rachadura aparece assim que existe um hábito: o ovo reage ao primeiro
            passo real, e não fica um enfeite parado à espera de nada. */}
        {temHabitos && (
          <path
            d="M24 30l5 4-4 5 6 3-3 5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}
      </svg>
    );
  }

  const { rx, ry, cy } = CORPOS[estagio];
  const cx = 32;
  const raioDoOlho = 2.3 + indice * 0.2;
  const olhoY = cy - ry * 0.22;

  return (
    <svg {...comum}>
      {gradiente}

      {/* Auréola do último estágio: três pontos, não uma coroa. Ninguém venceu nada —
          só se repetiu mais vezes do que a faixa observada por Lally. */}
      {estagio === 'completo' && (
        <g fill="var(--primary-purple)" opacity="0.55">
          <circle cx="32" cy="7" r="2" />
          <circle cx="23" cy="10" r="1.5" />
          <circle cx="41" cy="10" r="1.5" />
        </g>
      )}

      {/* Crista, a partir do terceiro degrau. */}
      {indice >= 2 && (
        <path
          d={`M ${cx} ${cy - ry - 1} c 0 -8 4 -11 8 -12 -1 6 -3 10 -8 12 z`}
          fill="var(--primary-purple)"
        />
      )}

      {/* Pés, sempre por baixo do corpo para não cortarem a silhueta. */}
      <ellipse cx={cx - rx * 0.45} cy={cy + ry - 1} rx="4" ry="2.6" fill="var(--primary-purple-dark)" />
      <ellipse cx={cx + rx * 0.45} cy={cy + ry - 1} rx="4" ry="2.6" fill="var(--primary-purple-dark)" />

      {/* Bracinhos, a partir do quarto degrau. */}
      {indice >= 3 && (
        <>
          <ellipse cx={cx - rx - 1} cy={cy + 2} rx="3.4" ry="5" fill="var(--primary-purple)" transform={`rotate(-18 ${cx - rx - 1} ${cy + 2})`} />
          <ellipse cx={cx + rx + 1} cy={cy + 2} rx="3.4" ry="5" fill="var(--primary-purple)" transform={`rotate(18 ${cx + rx + 1} ${cy + 2})`} />
        </>
      )}

      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${idGradiente})`} />

      <Olho humor={humor} x={cx - rx * 0.4} y={olhoY} r={raioDoOlho} />
      <Olho humor={humor} x={cx + rx * 0.4} y={olhoY} r={raioDoOlho} />
      <Boca humor={humor} cx={cx} y={olhoY + raioDoOlho * 2.6} />
    </svg>
  );
}

export default Criatura;
