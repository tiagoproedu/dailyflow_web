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

module.exports = app;