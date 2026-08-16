// src/components/layout/MainContent.jsx
import { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { buildIntention } from '../../utils/intention';
import Celebracao from '../ui/Celebracao';
import {
  reconhecerMarcacao,
  resumoDaSequencia,
  vibrar,
  PADRAO_MARCO,
  PADRAO_NORMAL,
} from '../../utils/celebracao';

function MainContent() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [celebracao, setCelebracao] = useState(null);

  const fetchSummary = async () => {
    try {
      const data = await apiClient('/dashboard');
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar o dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCompleteTask = async (taskId) => {
    try {
      await apiClient(`/tasks/${taskId}`, 'PATCH', { completed: true });
      fetchSummary();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      const resultado = await apiClient(`/habits/${habitId}/toggle-completion`, 'POST');

      // O reconhecimento sai dos números que o servidor recalculou depois de gravar.
      // Desmarcar não celebra nada — e apaga a frase anterior, que deixou de valer.
      if (resultado.completed) {
        const reconhecimento = reconhecerMarcacao(resultado.estatisticas);
        vibrar(reconhecimento.marco ? PADRAO_MARCO : PADRAO_NORMAL);
        setCelebracao({ ...reconhecimento, id: Date.now() });
      } else {
        setCelebracao(null);
      }

      fetchSummary();
    } catch (error) {
      console.error('Erro ao marcar hábito:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <p role="status">A carregar o seu dia…</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page-container">
        <p role="alert">Não foi possível carregar o dashboard.</p>
      </div>
    );
  }

  const { user, stats, recentTasks, habitsToday, routinesToday } = summary;

  return (
    <div className="page-container">
        <h1 className="page-title">Olá, {user?.name?.split(' ')[0] || 'você'}</h1>

        <Celebracao mensagem={celebracao} aoFechar={() => setCelebracao(null)} />

        <div className="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h2 className="card-title">Tarefas Pendentes</h2>
            <p className="card-metric card-metric-blue">{stats.pendingTasks}</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {stats.completedToday} concluída(s) hoje
            </p>
          </div>

          <div className="card">
            <h2 className="card-title">Hábitos de Hoje</h2>
            <p className="card-metric card-metric-purple">
              {stats.habitsDoneToday}/{stats.activeHabits}
            </p>
            {/* A barra é o que cobra: um progresso incompleto à vista incomoda mais
                que o mesmo número solto. Decorativa — a contagem acima já diz tudo
                a quem usa leitor de tela. */}
            {stats.activeHabits > 0 && (
              <div className="progresso" aria-hidden="true">
                <div
                  className="progresso-preenchido"
                  style={{
                    width: `${Math.round((stats.habitsDoneToday / stats.activeHabits) * 100)}%`,
                  }}
                />
              </div>
            )}
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {stats.activeHabits === 0
                ? 'Nenhum hábito criado ainda'
                : stats.habitsDoneToday === stats.activeHabits
                  ? 'Tudo feito hoje!'
                  : `Faltam ${stats.activeHabits - stats.habitsDoneToday}`}
            </p>
          </div>

          <div className="card">
            <h2 className="card-title">Rotinas Ativas</h2>
            <p className="card-metric card-metric-blue">{stats.activeRoutines}</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {stats.routinesNow > 0
                ? `${stats.routinesNow} para agora (${summary.timeOfDay})`
                : `Nenhuma para agora (${summary.timeOfDay})`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 grid-cols-lg-2">
          <div className="card">
            <h2 className="section-title">Tarefas Recentes</h2>
            {recentTasks.length === 0 ? (
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Nenhuma tarefa pendente. Aproveite ou crie a próxima.
              </p>
            ) : (
              <ul className="list">
                {recentTasks.map((task) => (
                  <li key={task.id} className="list-item">
                    <span>{task.text}</span>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Concluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2 className="section-title">Hábitos do Dia</h2>
            {habitsToday.length === 0 ? (
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Nenhum hábito ainda. Comece por um só — o pequeno é o que gruda.
              </p>
            ) : (
              <ul className="list">
                {habitsToday.map((habit) => (
                  <li key={habit.id} className="list-item">
                    {/* Era uma <div onClick>: invisível para o teclado e para o
                        leitor de tela. Um <button> resolve os dois de graça. */}
                    <button
                      type="button"
                      className="habit-toggle-button"
                      aria-pressed={habit.completedToday}
                      onClick={() => handleToggleHabit(habit.id)}
                    >
                      <span className="habit-linha-nome">
                        <span className={habit.completedToday ? 'habit-done' : undefined}>
                          {habit.name}
                        </span>
                        {/* Só aparece quando existe corrente. Exibir "0 dias" seria
                            mostrar a alguém que acabou de começar o quanto lhe falta. */}
                        {resumoDaSequencia(habit.estatisticas) && (
                          <span className="habit-streak">
                            {resumoDaSequencia(habit.estatisticas)}
                          </span>
                        )}
                      </span>
                      {buildIntention(habit) && (
                        <span className="habit-intention">{buildIntention(habit)}</span>
                      )}
                    </button>
                    {/* Os pontinhos viram uma lista com texto escondido: quem não
                        enxerga a cor ainda ouve "feito" ou "não feito" por dia. */}
                    <ul
                      className="habit-progress"
                      aria-label={`Últimos dias de ${habit.name}`}
                    >
                      {habit.lastDays.map((day) => (
                        <li
                          key={day.date}
                          className={`habit-dot ${day.completed ? 'completed' : ''}`}
                        >
                          <span className="sr-only">
                            {day.date}: {day.completed ? 'feito' : 'não feito'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {routinesToday.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h2 className="section-title">Rotinas</h2>
            <ul className="list">
              {routinesToday.map((routine) => (
                <li key={routine.id} className="list-item">
                  <span>
                    {routine.name}
                    {routine.isNow && ' — agora'}
                  </span>
                  <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                    {routine.timeOfDay} · {routine.taskCount} tarefa(s)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  )
}

export default MainContent
