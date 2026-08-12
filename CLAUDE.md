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

## Estado das funcionalidades

| Funcionalidade | Backend | Frontend |
|---|---|---|
| Auth (registro, login, rotas protegidas) | ✅ | ✅ |
| Tarefas (CRUD) | ✅ | ✅ |
| Hábitos + conclusões diárias | ✅ | ✅ |
| Rotinas (CRUD, tarefas-modelo, "iniciar hoje") | ✅ | ✅ |
| Dashboard agregado (`GET /api/dashboard`) | ✅ | ✅ |
| Gamificação (XP, moedas, loja) | ⬜ | ⬜ |
| IA geradora de rotinas | ⬜ | ⬜ |
| Deploy / PWA no celular | ⬜ | ⬜ |

## Endpoints

Todos sob `/api`, todos exigem `Authorization: Bearer <token>` exceto `/auth/*`.

```
POST   /auth/register            POST /auth/login
GET    /tasks                    POST /tasks
PATCH  /tasks/:id                DELETE /tasks/:id
GET    /habits                   POST /habits
PATCH  /habits/:id               DELETE /habits/:id
POST   /habits/:id/toggle-completion
GET    /routines                 POST /routines
PATCH  /routines/:id             DELETE /routines/:id
POST   /routines/:id/tasks       DELETE /routines/:id/tasks/:taskId
POST   /routines/:id/start       # copia as tarefas-modelo para tarefas reais de hoje
GET    /dashboard                # números + listas do dia
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
