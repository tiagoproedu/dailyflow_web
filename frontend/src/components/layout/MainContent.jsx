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

        {/* Os três números viraram uma faixa. Antes eram três cartões de ~200px
            cada, e os hábitos — o que a pessoa abriu o app para fazer — só
            apareciam depois de duas telas de rolagem. */}
        <div className="faixa-numeros">
          <div className="numero-do-dia">
            <span className="numero-do-dia-valor">{stats.pendingTasks}</span>
            <span className="numero-do-dia-rotulo">
              {stats.pendingTasks === 1 ? 'tarefa aberta' : 'tarefas abertas'}
            </span>
          </div>

          <div className="numero-do-dia roxo">
            <span className="numero-do-dia-valor">
              {stats.habitsDoneToday}/{stats.activeHabits}
            </span>
            <span className="numero-do-dia-rotulo">hábitos hoje</span>
          </div>

          <div className="numero-do-dia">
            <span className="numero-do-dia-valor">{stats.routinesNow}</span>
            <span className="numero-do-dia-rotulo">rotinas agora</span>
          </div>
        </div>

        <div className="grid grid-cols-1 grid-cols-lg-2">
          {/* Primeiro cartão da página: é a ação do dia, não um resumo dela. */}
          <div className="card card-secao">
            <h2 className="section-title">Hábitos do Dia</h2>
            {/* A barra é o que cobra: um progresso incompleto à vista incomoda
                mais que o mesmo número solto. Decorativa — a faixa acima já diz
                a contagem a quem usa leitor de tela. */}
            {stats.activeHabits > 0 && (
              <>
                <div className="progresso" aria-hidden="true">
                  <div
                    className="progresso-preenchido"
                    style={{
                      width: `${Math.round((stats.habitsDoneToday / stats.activeHabits) * 100)}%`,
                    }}
                  />
                </div>
                <p className="texto-apoio">
                  {stats.habitsDoneToday === stats.activeHabits
                    ? 'Tudo feito hoje.'
                    : `Faltam ${stats.activeHabits - stats.habitsDoneToday}.`}
                </p>
              </>
            )}
            {habitsToday.length === 0 ? (
              <p className="texto-apoio">
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

          <div className="card card-secao">
            <h2 className="section-title">Tarefas Recentes</h2>
            {recentTasks.length === 0 ? (
              <p className="texto-apoio">
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
        </div>

        {routinesToday.length > 0 && (
          <div className="card card-secao">
            <h2 className="section-title">Rotinas</h2>
            <ul className="list">
              {routinesToday.map((routine) => (
                <li key={routine.id} className="list-item">
                  <span>
                    {routine.name}
                    {routine.isNow && ' — agora'}
                  </span>
                  <span className="texto-apoio">
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
