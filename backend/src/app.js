const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const routineRoutes = require('./routes/routineRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const pushRoutes = require('./routes/pushRoutes');
const companheiroRoutes = require('./routes/companheiroRoutes');

const app = express();

//Middlewares globais
app.use(cors());
app.use(express.json());

//Rotas de API
app.get('/', (req, res) => res.send('API do DailyFlow está funcionando!'));
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/companheiro', companheiroRoutes);

// Qualquer outro caminho em /api responde JSON, não a página HTML padrão do Express
// (que o frontend não consegue ler).
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
});

// Último recurso: corpo JSON malformado e erros que escaparam de um controller.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'O corpo do pedido não é um JSON válido.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;