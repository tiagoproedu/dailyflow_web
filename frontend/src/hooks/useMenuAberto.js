// src/hooks/useMenuAberto.js
import { useEffect, useState } from 'react';

/**
 * Qual menu de ações ("⋯") está aberto numa lista. Fecha sozinho ao tocar fora dele
 * ou ao apertar Esc — antes o menu só fechava clicando de novo no mesmo botão.
 *
 * @returns {[string|null, Function]} O id do item com o menu aberto e o seu setter.
 */
export function useMenuAberto() {
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    if (aberto === null) return undefined;

    const aoTocar = (evento) => {
      if (!evento.target.closest('.task-actions-menu')) setAberto(null);
    };
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') setAberto(null);
    };

    document.addEventListener('pointerdown', aoTocar);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('pointerdown', aoTocar);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  return [aberto, setAberto];
}
