import apiClient from './api';

/**
 * Converte a chave VAPID (base64url) para o formato que o `subscribe` exige.
 * @param {string} base64 - A chave pública.
 * @returns {Uint8Array} A chave em bytes.
 */
const chaveParaBytes = (base64) => {
  const preenchimento = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalizada = (base64 + preenchimento).replace(/-/g, '+').replace(/_/g, '/');
  const bruto = window.atob(normalizada);

  return Uint8Array.from([...bruto].map((caractere) => caractere.charCodeAt(0)));
};

/**
 * Diz se este navegador consegue receber lembretes.
 *
 * Em HTTP puro nada disto existe: a Push API exige contexto seguro, por isso o app
 * precisa de ser aberto pelo endereço HTTPS.
 *
 * @returns {boolean} Se há suporte.
 */
export const temSuporte = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/**
 * O estado atual dos lembretes neste aparelho.
 * @returns {Promise<{suportado: boolean, permissao: string, inscrito: boolean}>} O estado.
 */
export const lerEstado = async () => {
  if (!temSuporte()) {
    return { suportado: false, permissao: 'indisponivel', inscrito: false };
  }

  const registo = await navigator.serviceWorker.getRegistration();
  const inscricao = await registo?.pushManager.getSubscription();

  return {
    suportado: true,
    permissao: Notification.permission,
    inscrito: Boolean(inscricao),
  };
};

/**
 * Pede permissão, inscreve o aparelho e regista-o no servidor.
 * @returns {Promise<{inscrito: boolean, motivo?: string}>} O resultado.
 */
export const ligar = async () => {
  if (!temSuporte()) {
    return { inscrito: false, motivo: 'indisponivel' };
  }

  const permissao = await Notification.requestPermission();

  if (permissao !== 'granted') {
    return { inscrito: false, motivo: permissao === 'denied' ? 'bloqueado' : 'recusado' };
  }

  const { chavePublica } = await apiClient('/push/chave-publica');
  const registo = await navigator.serviceWorker.ready;

  // Reaproveita a inscrição existente: chamar `subscribe` duas vezes com a mesma chave
  // devolve a mesma, mas com chave diferente rebenta.
  const inscricao =
    (await registo.pushManager.getSubscription()) ||
    (await registo.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: chaveParaBytes(chavePublica),
    }));

  await apiClient('/push/inscrever', 'POST', inscricao.toJSON());

  return { inscrito: true };
};

/**
 * Desliga os lembretes neste aparelho, no navegador e no servidor.
 * @returns {Promise<{inscrito: boolean}>} O resultado.
 */
export const desligar = async () => {
  const registo = await navigator.serviceWorker.getRegistration();
  const inscricao = await registo?.pushManager.getSubscription();

  if (inscricao) {
    // O servidor é avisado antes de a inscrição ser destruída — depois o endpoint some.
    await apiClient('/push/cancelar', 'POST', { endpoint: inscricao.endpoint });
    await inscricao.unsubscribe();
  }

  return { inscrito: false };
};

/**
 * Pede ao servidor um lembrete de teste.
 * @returns {Promise<object>} O resultado do envio.
 */
export const testar = () => apiClient('/push/testar', 'POST');
