/* eslint-env serviceworker */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

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

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: dados.corpo || 'Você tem algo para fazer agora.',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: dados.tag || 'dailyflow',
      renotify: true,
      lang: 'pt-BR',
      data: { url: dados.url || '/dashboard' },
    })
  );
});

/**
 * Tocou na notificação: reaproveita a janela já aberta em vez de abrir outra.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((janela) => janela.url.includes(self.location.origin));

      if (aberta) {
        return aberta.focus().then((janela) => janela.navigate?.(destino) || janela);
      }

      return clients.openWindow(destino);
    })
  );
});
