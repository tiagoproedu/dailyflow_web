import React from 'react';

// Ícone de exemplo para "Criar Rotina" (pode ser o mesmo PlusIcon ou outro)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Ícone de exemplo para ações da rotina
const DotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

// Ícone de exemplo para "IA Gerada"
const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-xs" style={{ color: 'var(--primary-purple-medium)'}}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188a2.25 2.25 0 00-1.75-1.75L12 9l2.188-1.25a2.25 2.25 0 001.75-1.75L17 3.813l1.25 2.188a2.25 2.25 0 001.75 1.75L22.188 9l-2.188 1.25a2.25 2.25 0 00-1.75 1.75z" />
  </svg>
);


function RoutinesPage() {
  // Dados de exemplo para as rotinas
  const routines = [
    { 
      id: 1, 
      name: 'Rotina Matinal Produtiva', 
      timeOfDay: 'Manhã', 
      description: 'Comece o dia com foco e energia.',
      tasks: ['Arrumar a cama', 'Beber um copo d\'água', 'Meditar 10 min', 'Café da manhã saudável'],
      aiGenerated: true,
      active: true
    },
    { 
      id: 2, 
      name: 'Rotina Noturna Relaxante', 
      timeOfDay: 'Noite', 
      description: 'Prepare-se para uma noite de sono restauradora.',
      tasks: ['Chá calmante', 'Ler um livro', 'Alongamento leve', 'Desligar eletrônicos 1h antes'],
      aiGenerated: false,
      active: true
    },
    { 
      id: 3, 
      name: 'Pausa Ativa da Tarde', 
      timeOfDay: 'Tarde', 
      description: 'Recarregue as energias no meio do dia.',
      tasks: ['Caminhada curta', 'Lanche com frutas', 'Beber água'],
      aiGenerated: true,
      active: false
    },
  ];

  return (
    <div className="page-container routines-page">
      <div className="page-header-custom">
        <h1 className="page-title">Minhas Rotinas</h1>
        <button className="btn btn-primary add-routine-button">
          <PlusIcon />
          Criar Rotina
        </button>
      </div>

      <div className="routine-list">
        {routines.map(routine => (
          <div key={routine.id} className={`routine-card card ${routine.active ? 'active' : 'inactive'}`}>
            <div className="routine-card-header">
              <h2 className="routine-name">{routine.name}</h2>
              <div className="routine-actions">
                {routine.aiGenerated && (
                  <span className="ai-badge" title="Gerada por IA">
                    <AiIcon /> IA
                  </span>
                )}
                <button className="routine-action-button task-action-button"> {/* Reutilizando classe */}
                  <DotsIcon />
                </button>
              </div>
            </div>
            <p className="routine-time">{routine.timeOfDay}</p>
            <p className="routine-description">{routine.description}</p>
            <div className="routine-tasks-preview">
              <h3 className="preview-title">Tarefas Principais:</h3>
              <ul>
                {routine.tasks.slice(0, 3).map((task, index) => ( // Mostra apenas as 3 primeiras tarefas como prévia
                  <li key={index}>{task}</li>
                ))}
                {routine.tasks.length > 3 && <li>... e mais</li>}
              </ul>
            </div>
            <div className="routine-card-footer">
              <button className="btn btn-outline btn-xs">Ver Detalhes</button>
              {/* Você pode adicionar um toggle para ativar/desativar a rotina aqui */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoutinesPage;