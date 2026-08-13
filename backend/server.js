require('dotenv').config();

// O fuso tem de ser definido antes de qualquer `new Date()` do processo. Sem isto o
// container roda em UTC e tudo o que depende de "hoje" sai errado: a conclusão de um
// hábito marcado às 23:00 cairia no dia seguinte e o lembrete das 08:00 tocaria às 05:00.
process.env.TZ = process.env.TZ || 'America/Fortaleza';

const app = require('./src/app');
const { iniciarLembretes } = require('./src/jobs/lembretesJob');
const port = 3001;

app.listen(port, () => {
  console.log(`Servidor do DailyFlow rodando em http://localhost:${port} (fuso ${process.env.TZ})`);
  iniciarLembretes();
});
