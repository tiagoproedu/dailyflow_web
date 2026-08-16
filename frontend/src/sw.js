/* eslint-env serviceworker */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { reconhecerMarcacao } from './utils/celebracao';

// O `self.__WB_MANIFEST` é substituído no build pela lista de ficheiros a pré-carregar.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// O app funciona offline, mas os dados nunca vêm de cache: hábito e tarefa marcados
// precisam refletir o estado real do servidor.
registerRoute(({ url }) => url.pathname.startsWith('/api'), new NetworkOnly());

// Com `registerType: 'autoUpdate'` a versão nova assume assim que fica pronta, em vez
// de esperar o utilizador fechar todas as abas.
self.skipWaiting();
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const ICONES = { icon: '/pwa-192.png', badge: '/pwa-192.png', lang: 'pt-BR' };

/**
 * Chegou um lembrete do servidor.
 *
 * O payload vem do `pushServices`. Se por alguma razão vier vazio ou ilegível, mostra-se
 * uma notificação genérica: engolir o evento faria o Android exibir sozinho um aviso de
 * "site atualizado em segundo plano", que é pior do que uma mensagem simples.
 */
self.addEventListener('push', (event) => {
  let dados = {};

  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {};
  }

  const titulo = dados.titulo || 'DailyFlow';

  // O botão só aparece quando o servidor mandou uma ação junto — ou seja, quando o
  // lembrete é de um hábito só e não há dúvida sobre o que "Feito" significa.
  const botoes = dados.acao ? [{ action: 'feito', title: dados.acao.titulo || 'Feito ✓' }] : [];

  event.waitUntil(
    self.registration.showNotification(titulo, {
      ...ICONES,
      body: dados.corpo || 'Você tem algo para fazer agora.',
      tag: dados.tag || 'dailyflow',
      renotify: true,
      actions: botoes,
      data: { url: dados.url || '/dashboard', acao: dados.acao || null },
    })
  );
});

/**
 * Marca o hábito falando direto com a API, sem abrir o app.
 *
 * A autorização é o token que veio dentro do lembrete: ele só sabe marcar aquele hábito
 * naquele dia. O token de sessão não passa por aqui de propósito — ver
 * `backend/src/services/acaoRapidaServices.js`.
 *
 * Devolve sempre algo para mostrar. Ficar em silêncio depois de um toque é a pior das
 * saídas: a pessoa não sabe se marcou, e vai abrir o app para conferir — que é
 * exatamente o passo que este botão existe para eliminar.
 *
 * @param {object} dados - O `data` da notificação.
 * @returns {Promise<{titulo: string, corpo: string, ok: boolean}>} O aviso a exibir.
 */
const marcarHabito = async (dados) => {
  const token = dados && dados.acao ? dados.acao.token : null;

  if (!token) {
    return { titulo: 'DailyFlow', corpo: 'Abra o app para marcar este hábito.', ok: false };
  }

  try {
    const resposta = await fetch('/api/push/marcar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      return {
        titulo: 'Não deu para marcar',
        corpo: erro.error || 'Abra o app e marque por lá.',
        ok: false,
      };
    }

    const resultado = await resposta.json();

    // A frase é a mesma que apareceria dentro do app: uma só fonte para o
    // reconhecimento, e os números vêm do servidor.
    const corpo = resultado.jaEstava
      ? 'Este já estava marcado hoje.'
      : reconhecerMarcacao(resultado.estatisticas).texto;

    return { titulo: `${resultado.nome}: feito`, corpo, ok: true };
  } catch {
    // Sem rede. Dizer que marcou seria mentira, e a pessoa contaria com isso.
    return {
      titulo: 'Sem ligação',
      corpo: 'Não deu para marcar agora. Abra o app quando tiver rede.',
      ok: false,
    };
  }
};

/**
 * Abre o app, reaproveitando a janela já aberta em vez de abrir outra.
 * @param {string} destino - O caminho a abrir.
 * @returns {Promise} A janela focada ou aberta.
 */
const abrirApp = (destino) =>
  clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
    const aberta = janelas.find((janela) => janela.url.includes(self.location.origin));

    if (aberta) {
      return aberta.focus().then((janela) => janela.navigate?.(destino) || janela);
    }

    return clients.openWindow(destino);
  });

/**
 * Tocou na notificação — no botão "Feito ✓" ou no corpo dela.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const dados = event.notification.data || {};

  if (event.action === 'feito') {
    event.waitUntil(
      marcarHabito(dados).then((aviso) =>
        self.registration.showNotification(aviso.titulo, {
          ...ICONES,
          body: aviso.corpo,
          tag: 'dailyflow-confirmacao',
          renotify: true,
          // Deu certo: confirma sem vibrar de novo, porque o toque acabou de acontecer.
          // Deu errado: faz barulho, porque a pessoa precisa de saber.
          silent: aviso.ok,
          data: { url: '/dashboard' },
        })
      )
    );
    return;
  }

  event.waitUntil(abrirApp(dados.url || '/dashboard'));
});
