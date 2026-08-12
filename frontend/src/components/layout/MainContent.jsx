// src/components/layout/MainContent.jsx
import { useEffect, useState } from 'react';
import apiClient from '../../services/api';

function MainContent() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      await apiClient(`/habits/${habitId}/toggle-completion`, 'POST');
      fetchSummary();
    } catch (error) {
      console.error('Erro ao marcar hábito:', error);
    }
  };

  if (isLoading) {
    return (
      <main className={'main-content'}>
        <div className="page-container">
          <p style={{ color: '#6B7280' }}>A carregar o seu dia...</p>
        </div>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className={'main-content'}>
        <div className="page-container">
          <p style={{ color: '#6B7280' }}>Não foi possível carregar o dashboard.</p>
        </div>
      </main>
    );
  }

  const { user, stats, recentTasks, habitsToday, routinesToday } = summary;

  return (
    <main className={'main-content'}>
      <div className="page-container">
        <h1 className="page-title">Olá, {user?.name?.split(' ')[0] || 'você'}</h1>

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
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {stats.activeHabits === 0
                ? 'Nenhum hábito criado ainda'
                : stats.habitsDoneToday === stats.activeHabits
                  ? 'Tudo feito hoje!'
                  : 'Ainda dá tempo'}
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
                    <span
                      onClick={() => handleToggleHabit(habit.id)}
                      style={{
                        cursor: 'pointer',
                        textDecoration: habit.completedToday ? 'line-through' : 'none',
                      }}
                    >
                      {habit.name}
                    </span>
                    <div className="habit-progress">
                      {habit.lastDays.map((day) => (
                        <div
                          key={day.date}
                          title={day.date}
                          className={`habit-dot ${day.completed ? 'completed' : ''}`}
                        />
                      ))}
                    </div>
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
    </main>
  )
}

export default MainContent
