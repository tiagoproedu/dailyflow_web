// src/utils/datas.js

/**
 * O dia de uma data no calendário local, no formato "AAAA-MM-DD".
 *
 * Não use `toISOString()` para isto: ele converte para UTC, e em Fortaleza (UTC-3)
 * qualquer hora depois das 21:00 já cai no dia seguinte.
 *
 * @param {Date} data - A data (por omissão, agora).
 * @returns {string} O dia, ex.: "2026-09-30".
 */
export const chaveDoDia = (data = new Date()) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};
