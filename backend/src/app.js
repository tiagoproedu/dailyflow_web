const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

//Middlewares globais
app.use(cors());
app.use(express.json());

//Rotas de API
app.get('/', (req, res) => res.send('API do DailyFlow está funcionando!'));
app.use('/api/tasks', taskRoutes);

module.exports = app;