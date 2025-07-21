import React from 'react';

// Ícone de exemplo para o botão "Adicionar Hábito" (pode ser o mesmo de Tarefas ou outro)
// Se quiser um ícone diferente, você pode procurar por SVGs de "check", "alvo", "planta crescendo", etc.
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Ícone de exemplo para ações do hábito (pode ser o mesmo de Tarefas)
const DotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

function HabitsPage() {
  // Dados de exemplo para os hábitos
  const habits = [
    { id: 1, name: 'Ler 30 páginas de um livro', completedToday: true, streak: 15, category: 'Desenvolvimento Pessoal' },
    { id: 2, name: 'Beber 2L de água', completedToday: false, streak: 5, category: 'Saúde' },
    { id: 3, name: 'Fazer 20 minutos de exercício', completedToday: true, streak: 32, category: 'Saúde' },
    { id: 4, name: 'Meditar por 10 minutos', completedToday: false, streak: 0, category: 'Bem-estar' },
    { id: 5, name: 'Estudar React por 1 hora', completedToday: true, streak: 3, category: 'Desenvolvimento Profissional' },
  ];

  // Função para simular a marcação de um hábito (você precisará de um estado para isso)
  const handleToggleHabit = (habitId) => {
    console.log(`Hábito ${habitId} clicado. Implementar lógica de estado.`);
    // Exemplo: setHabits(habits.map(h => h.id === habitId ? {...h, completedToday: !h.completedToday} : h));
  };

  return (
    <div className="page-container habits-page">
      <div className="page-header-custom"> {/* Usando uma classe customizada para header da página se necessário */}
        <h1 className="page-title">Meus Hábitos</h1>
        <button className="btn btn-primary add-habit-button">
          <PlusIcon />
          Adicionar Hábito
        </button>
      </div>

      <div className="habit-list-container card"> {/* Reutilizando a classe card para o container da lista */}
        <ul className="habit-list">
          {habits.map(habit => (
            <li key={habit.id} className={`habit-item ${habit.completedToday ? 'completed' : ''}`}>
              <div className="habit-item-content">
                {/* Poderia ser um botão customizado no lugar do checkbox para marcar como feito */}
                <button 
                  className={`habit-complete-button ${habit.completedToday ? 'done' : ''}`}
                  onClick={() => handleToggleHabit(habit.id)}
                  aria-label={habit.completedToday ? 'Marcar como não concluído' : 'Marcar como concluído'}
                >
                  {/* Visual do botão de completar (pode ser um ícone de check) */}
                  {habit.completedToday ? '✔' : ''}
                </button>
                <span className="habit-name">{habit.name}</span>
              </div>
              <div className="habit-item-details">
                <span className="habit-streak">
                  🔥 {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'}
                </span>
                <span className="habit-category">{habit.category}</span>
                <button className="habit-action-button task-action-button"> {/* Reutilizando classe do botão de ação de tarefas */}
                  <DotsIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HabitsPage;