# DailyFlow

> Seu assistente de hábitos, rotinas e produtividade.

**Autor:** Tiago da Silva Barbosa · **Status:** uso pessoal, caminhando para protótipo final

## O problema e a solução

**Problema:** pessoas querem ser mais produtivas, mas falham por falta de motivação,
planejamento, desorganização ou procrastinação.

**Solução:** um app que combina hábitos, rotinas personalizadas e metas divididas em
microtarefas, com IA para adaptação contínua e gamificação para engajamento.
Referência de inspiração: Habitica (com ressalvas — ver `docs/gamificacao.md`).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 4 + react-router-dom 7, **CSS puro** (sem Tailwind/UI kit) |
| Backend | Express 5, arquitetura routes → controllers → services |
| Banco | PostgreSQL via Prisma 6 |
| Auth | JWT (`CHAVE_SECRETA` no `.env`) + bcryptjs, token no `localStorage` |

## Estrutura

```
web/
├── backend/
│   ├── server.js              # ponto de entrada
│   ├── prisma/schema.prisma   # User, Task, Routine, Habit, HabitCompletion
│   └── src/
│       ├── app.js             # registra as rotas /api/*
│       ├── routes/            # define endpoints, aplica `protect`
│       ├── controllers/       # trata req/res e códigos de erro HTTP
│       ├── services/          # regra de negócio + Prisma
│       └── middlewares/authMiddleware.js  # `protect` → popula req.user
└── frontend/
    ├── src/Routes.jsx         # rotas públicas e privadas (ProtectedRoute)
    ├── src/services/api.js    # `apiClient(endpoint, method, body)` — usar sempre este
    ├── src/context/AuthContext.jsx
    ├── src/components/layout/ # Header, Sidebar, MainContent (= Dashboard)
    └── src/pages/
```

## Convenções do projeto

- **Idioma:** todo o código, comentários e mensagens de erro em **português**.
- **Camadas:** nunca chamar o Prisma direto de um controller. Service faz a regra,
  controller só traduz para HTTP.
- **Autorização:** todo service que recebe um `id` de recurso confere se ele pertence ao
  `userId` antes de agir, e lança `Error('... não encontrada ou não pertence ao utilizador.')`.
  O controller converte essa mensagem em `404`.
- **Frontend:** nada de `fetch` solto — sempre `apiClient`, que já injeta o token JWT.
- **CSS:** classes reutilizadas entre páginas (`card`, `task-item`, `btn btn-primary`,
  `page-container`). Estilos ficam em `src/styles/App.css`.
- **Commits:** mensagens em português, prefixos `feat:` / `fix:` / `chore:`.

## Desenho da interface

O app é feito para o celular, com uma mão. O que decorre disso:

| Peça | Onde |
|---|---|
| Destinos e ícones (fonte única) | `frontend/src/components/layout/navegacao.jsx` |
| Barra inferior (celular) | `frontend/src/components/layout/BottomNav.jsx` |
| Barra lateral (desktop) | `frontend/src/components/layout/Sidebar.jsx` |
| Tokens, faixa de números, listas | bloco "REVISÃO VISUAL" no fim do `App.css` |

- **A navegação do celular é a barra inferior**, não a gaveta. A gaveta abria por um botão
  no canto superior esquerdo — o ponto mais difícil de alcançar com o polegar. Abaixo de
  768px a `.sidebar`, o fundo dela e o botão de menu ficam em `display: none`; acima, a
  `.bottom-nav` é que desaparece.
- **Os destinos vivem em `navegacao.jsx`**, não duplicados nas duas barras.
- **Cuidado com `.task-item` ao mexer em CSS de lista:** um hábito na lista carrega as
  duas classes (`habit-item task-item`) para reaproveitar estilo. Regras de tarefa no
  celular precisam de `:not(.habit-item)`, senão esmagam o hábito — o texto chega a quebrar
  letra a letra. Tarefa é uma linha; hábito é um bloco com gatilho e barra de progresso.
- **Qualquer coisa fixa no rodapé** (a faixa de reconhecimento) tem de subir acima da
  `--altura-nav` e do `env(safe-area-inset-bottom)`.
- **Alvo de toque não pode depender de `@media (pointer: coarse)`** — nem todo aparelho
  anuncia ponteiro grosseiro. Onde importa, `min-height: 44px` direto.
- O `.card` das listas tem `padding: 0`: cartão com padding mais item com padding roubava
  32px de largura útil numa tela de 360px.

## Acessibilidade

O app é usado principalmente no celular, com uma mão. Regras que valem para
qualquer tela nova:

- **Todo formulário longo vive dentro do `Modal`**, que já rola por dentro e gruda
  o `.form-actions` no rodapé. Não crescer o formulário fora dele.
- **Alvo de toque mínimo de 44px** em qualquer coisa clicável. `.btn-xs` é a única
  exceção (36px no celular), e só onde o botão é secundário.
- **Botão só com ícone precisa de `aria-label`**, e o `<svg>` dentro dele leva
  `aria-hidden="true"`.
- **Checkbox sempre dentro de um `<label>`** (classe `item-toggle`): é o que dá nome
  ao campo para o leitor de tela e aumenta a área de toque.
- **Nunca `onClick` numa `<div>`.** Use `<button>` — teclado e leitor de tela vêm de
  graça.
- **Cor nunca é a única pista.** Os pontinhos de hábito usam contorno vs. preenchido;
  erro de formulário usa `.form-error`, com borda e texto.
- **Erro de API vira texto na tela**, não só `console.error`.
- **Contraste:** `--neutral-gray-medium` é o cinza mais claro permitido para texto e
  bordas (4,8:1). Abaixo disso, só traço decorativo (`--neutral-gray-line`).
- Mensagens que aparecem sozinhas levam `role="status"`; erros, `role="alert"`.

## Fuso horário

O app roda em **America/Fortaleza**, definido em dois lugares: `TZ` no `compose.yaml` e um
padrão no topo do `server.js` (antes de qualquer `new Date()`). **Não remover nenhum dos
dois.** Sem eles o container roda em UTC e tudo o que depende de "hoje" sai errado: um
hábito marcado às 23:00 é gravado no dia seguinte e o dashboard chama a noite de "Manhã".

A imagem `node:22-alpine` não traz base de fusos, mas o Node carrega a própria (ICU), por
isso `Date` e `Intl` acertam mesmo com `/usr/share/zoneinfo` ausente — só o `date` do shell
mostra UTC. Toda a lógica de data vive no Node, então isso é inofensivo.

## Lembretes (push)

O celular avisa na hora do gatilho de cada hábito — é o `cueTime`, que já existia no schema
e não era usado para nada. Peças:

| Peça | Onde |
|---|---|
| Envio (VAPID, limpeza de inscrição morta) | `backend/src/services/pushServices.js` |
| Agendador de minuto em minuto | `backend/src/jobs/lembretesJob.js` |
| Service worker (`push`, `notificationclick`) | `frontend/src/sw.js` |
| Ligar/desligar no aparelho | `frontend/src/components/profile/SecaoLembretes.jsx` |

Regras que valem ao mexer nisto:

- **O cron é `* * * * *` de propósito.** Quem decide se é a hora é o `horaLocal()`, com a
  hora local do Node. Assim o fuso do cron deixa de ser um ponto de falha.
- **Hábito já marcado hoje não gera lembrete.** Avisar sobre o que a pessoa já fez é a
  forma mais rápida de ela aprender a ignorar as notificações.
- Dois hábitos no mesmo horário viram **uma** notificação, não duas vibrações.
- **A inscrição é por aparelho, não por conta.** O estado tem de ser lido do navegador
  (`lerEstado()`), nunca assumido a partir do servidor.
- Inscrição que o serviço de push rejeita com 404/410 é apagada sozinha.
- As chaves VAPID vivem só nos `.env` (local e servidor). A pública é servida por
  `GET /push/chave-publica` para não acoplar chave nenhuma ao build do frontend.
- O service worker usa `strategies: 'injectManifest'` — o gerado automaticamente não
  aceita handler de `push`. Ao mexer no `vite.config.js`, não voltar para `generateSW`.
- **Push exige HTTPS.** Pelo endereço HTTP da Tailscale nada disto existe.

### O botão "Feito ✓" da notificação

Marcar sem abrir o app. A parte delicada é a autorização: o service worker não enxerga o
`localStorage`, onde vive o token de sessão.

- **O token de sessão não sai do `localStorage`.** Copiá-lo para o IndexedDB (que o service
  worker lê) deixaria uma credencial de 30 dias com acesso total à conta ao alcance de
  qualquer script da origem, e ela sobreviveria ao "sair da conta". Em vez disso o lembrete
  carrega um token que só sabe marcar **um** hábito **num** dia — `acaoRapidaServices.js`.
- **A chave desses tokens é derivada da `CHAVE_SECRETA`, mas não é ela.** Assim um token de
  ação nunca passa no `protect` e um token de sessão nunca marca um hábito.
- **`POST /push/marcar` fica antes do `router.use(protect)`** no `pushRoutes.js`, de
  propósito: ela autentica-se pelo token da ação.
- **A operação é marcar, nunca alternar.** Se fosse `toggle`, tocar numa notificação antiga
  apagaria a conclusão do dia. Tocar duas vezes não duplica nada.
- **O dia vai dentro do token.** Uma notificação de ontem esquecida na gaveta não marca
  hoje — devolve 409.
- **Só há botão quando o lembrete tem um hábito só.** Com dois, "Feito" marcaria o quê?
  Nesse caso a notificação apenas abre o app.
- **O service worker sempre responde alguma coisa**, inclusive sem rede. Silêncio depois de
  um toque faz a pessoa abrir o app para conferir — o passo que o botão existe para tirar.
  Sucesso é `silent: true` (o toque acabou de acontecer); falha faz barulho.

## Sequência e reconhecimento

O que faz alguém voltar ao app está estudado em `docs/engajamento.md` — o que Instagram,
TikTok e Duolingo têm em comum e quais dessas mecânicas servem aqui. `docs/gamificacao.md`
continua a valer para **o que** recompensar; aquele documento trata de **como prender**.

| Peça | Onde |
|---|---|
| Sequência, consistência 30 dias, automaticidade | `backend/src/services/streakServices.js` |
| Frase de reconhecimento ao marcar | `frontend/src/utils/celebracao.js` |
| Faixa fixa no rodapé que a exibe | `frontend/src/components/ui/Celebracao.jsx` |
| Barra de automaticidade por hábito | `frontend/src/components/habits/ProgressoDoHabito.jsx` |

Regras que valem ao mexer nisto:

- **Sequência e recorde são calculados, nunca guardados.** As colunas `currentStreak` e
  `longestStreak` existiam, ninguém escrevia nelas e a API devolvia zero para sempre —
  foram removidas. Um contador guardado diverge do histórico assim que uma conclusão
  antiga é apagada.
- **Uma falha grátis por semana**, e só se o dia anterior foi feito: duas ausências
  seguidas quebram mesmo. A sequência conta apenas dias realmente feitos — o dia
  perdoado mantém a corrente viva sem entrar na contagem.
- **A sequência nunca aparece sozinha.** Vem sempre com a consistência de 30 dias, que é o
  número que sobrevive a um dia ruim.
- **Nada de zeros.** Hábito sem repetição nenhuma não mostra "0 dias" nem "0%": a seção
  simplesmente não aparece.
- **A frase de reconhecimento varia**, mas todo número dentro dela vem do servidor, que
  recalcula depois de gravar. Por isso `POST /habits/:id/toggle-completion` devolve
  `{ completed, estatisticas }`.
- **A faixa é `position: fixed` no rodapé.** No celular a lista de hábitos fica no fim de
  uma página comprida; um aviso no topo apareceria fora do campo de visão de quem acabou
  de tocar.
- **Nada pune.** Sem dano, sem vermelho, sem "você falhou" — falhar um dia não atrapalha a
  formação do hábito (Lally). O lembrete cita a sequência como facto, nunca como ameaça.

## Nada de tela falsa

O app começou com páginas de exemplo cheias de dados inventados. Foram todas
removidas — a última foi o Perfil, que exibia um plano "Premium" e uma data de
cobrança que não existiam. **Regra:** nenhum número, botão ou seção entra na tela
sem estar ligado ao banco. Se a funcionalidade ainda não existe, a seção não
aparece; melhor faltar do que mentir.

Fora do escopo do v1, de propósito: gerador de rotinas com IA e gamificação
(moedas/XP — `virtualCoins` está no schema mas ninguém escreve nele).

> O `npm run lint` já falha na origem com ~15 erros de `react/prop-types` — o projeto
> nunca declarou PropTypes. Ao mexer, compare a contagem antes e depois em vez de
> esperar zero.

## Estado das funcionalidades

| Funcionalidade | Backend | Frontend |
|---|---|---|
| Auth (registro, login, sessão de 30d, rotas protegidas) | ✅ | ✅ |
| Tarefas (CRUD) | ✅ | ✅ |
| Hábitos + conclusões diárias | ✅ | ✅ |
| Rotinas (CRUD, tarefas-modelo, "iniciar hoje") | ✅ | ✅ |
| Dashboard agregado (`GET /api/dashboard`) | ✅ | ✅ |
| Perfil real + sair da conta | ✅ | ✅ |
| Lembretes push na hora do gatilho | ✅ | ✅ |
| Gamificação (XP, moedas, loja) | ⬜ | ⬜ |
| IA geradora de rotinas | ⬜ | ⬜ |
| Deploy / PWA no celular | ✅ | ✅ |
| Sequência, consistência e automaticidade | ✅ | ✅ |
| Marcar o hábito pela própria notificação | ✅ | ✅ |
| Calendário de hábitos | ⬜ | ⬜ |

## Endpoints

Todos sob `/api`, todos exigem `Authorization: Bearer <token>` exceto `/auth/*`.

```
POST   /auth/register            POST /auth/login
GET    /tasks                    POST /tasks
PATCH  /tasks/:id                DELETE /tasks/:id
GET    /habits                   POST /habits
PATCH  /habits/:id               DELETE /habits/:id
POST   /habits/:id/toggle-completion   # devolve { completed, estatisticas }
GET    /routines                 POST /routines
PATCH  /routines/:id             DELETE /routines/:id
POST   /routines/:id/tasks       DELETE /routines/:id/tasks/:taskId
POST   /routines/:id/start       # copia as tarefas-modelo para tarefas reais de hoje
GET    /dashboard                # números + listas do dia
GET    /profile                  # dados do utilizador + estatísticas reais
GET    /push/chave-publica       GET  /push/estado
POST   /push/inscrever           POST /push/cancelar
POST   /push/testar              # lembrete de teste, para conferir no aparelho
POST   /push/marcar              # botao "Feito" da notificacao; autentica-se pelo token da acao
```

### Modelo de Rotinas

Uma `Routine` guarda **tarefas-modelo** (`Task` com `isTemplate: true`). Elas não aparecem
na lista de tarefas do dia. Ao clicar em "Iniciar hoje", o service copia cada modelo para
uma `Task` real (`isTemplate: false`) daquele dia — e não duplica se a rotina já foi
iniciada hoje.

## Rodando o projeto

Node fica no nvm (`~/.nvm/versions/node/v24.15.0/bin`), não está no PATH padrão.

O banco fica no servidor caseiro **`fibbo-server`** (`ssh footy`), num container Docker
próprio (`~/dailyflow-db/compose.yaml`, container `dailyflow_postgres`, volume
`dailyflow-db_dailyflow_pgdata`). Ele escuta **apenas no IP da Tailscale**
(`100.96.187.34:5432`) — não está exposto na LAN nem na internet. O Postgres do Immich que
roda no mesmo servidor é outro container e não deve ser tocado.

```bash
# backend  (precisa de um PostgreSQL acessível em DATABASE_URL)
cd backend && npx prisma migrate deploy && npm start   # porta 3001

# frontend
cd frontend && npm run dev                             # porta 5173
```

**Atenção:** o projeto foi desenvolvido no Windows. Ao trocar de máquina é preciso
`rm -rf node_modules && npm install && npx prisma generate` — o Prisma compila um binário
específico por sistema operacional.

## Publicando (PWA no celular)

```bash
./deploy/publicar.sh     # compila, envia e sobe tudo no fibbo-server
```

O script manda o código para `~/dailyflow-app` no servidor (via `tar` sobre ssh — o
servidor **não tem rsync**) e sobe dois containers:

| Container | Papel |
|---|---|
| `dailyflow_api` | backend Node. Sem porta publicada: só o Caddy fala com ele. |
| `dailyflow_web` | Caddy: serve `dist/` e faz proxy de `/api` → `api:3001`. |

O `.env` de produção mora **apenas no servidor** (`~/dailyflow-app/.env`, chmod 600) e nunca
é enviado pelo script. Lá o `DATABASE_URL` aponta para `db:5432`, pelo nome do serviço na
rede `dailyflow-db_default`.

O TLS é terminado pelo `tailscale serve`, por isso o Caddy fala HTTP puro na 8080:

```bash
sudo tailscale serve --bg http://127.0.0.1:8080   # publica em https://fibbo-server.tail1b8792.ts.net
```

> **Nunca retentar emissão de certificado em loop.** A Let's Encrypt bloqueia após
> **5 autorizações falhas por hora** no mesmo domínio, e cada tentativa deixa mais um TXT
> obsoleto em `_acme-challenge.fibbo-server.tail1b8792.ts.net`. Retentar rápido transforma
> uma falha temporária em uma hora parado e ainda piora a causa. Se falhar: **uma
> tentativa, depois espere horas.** Diagnóstico sem gastar cota:
> `tailscale debug daemon-logs` e `nslookup -type=TXT _acme-challenge.<host> 199.247.155.53`.

### PWA

`vite-plugin-pwa` gera o manifest e o service worker. Duas regras importantes:

- **Chamadas a `/api` são `NetworkOnly`.** Hábito marcado e tarefa concluída precisam
  refletir o servidor — dado de cache aqui seria mentira na tela.
- O Caddy manda `no-store` em `sw.js`, `registerSW.js` e `manifest.webmanifest`, senão o
  app trava numa versão velha para sempre.

Os ícones em `frontend/public/` são gerados a partir de
`dailyflow/landingPage/src/assets/logo.png`. O `pwa-maskable-512.png` usa o logo a 60% do
quadro para sobreviver ao recorte circular do Android.
