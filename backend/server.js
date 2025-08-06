// Importa o Express para criar o servidor
const express = require('express');

// Importa o Prisma Client para interagir com o banco de dados
const { PrismaClient } = require('@prisma/client');

// Importa o CORS para permitir a comunicação entre frontend e backend
const cors = require('cors');

// Inicializa o Express
const app = express();
const port = 3001;

// Inicializa o Prisma Client
const prisma = new PrismaClient();

// --- Middlewares Essenciais ---
// Habilita o CORS para todas as rotas
app.use(cors());

// Permite que o servidor entenda requisições com corpo em formato JSON
app.use(express.json());


// --- Rotas da API ---

// Rota de teste para ver se o servidor está no ar
app.get('/', (req, res) => {
  res.send('API do DailyFlow está funcionando!');
});

// ROTA 1: Buscar todas as tarefas (que não são templates)
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        isTemplate: false // A mágica acontece aqui! Só pegamos tarefas reais.
      },
      orderBy: {
        createdAt: 'desc' // Ordena as mais recentes primeiro
      }
    });
    res.json(tasks); // Envia as tarefas encontradas como resposta
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    res.status(500).json({ error: 'Não foi possível buscar as tarefas.' });
  }
});


// --- Inicialização do Servidor ---
app.listen(port, () => {
  console.log(`Servidor do DailyFlow rodando em http://localhost:${port}`);
});