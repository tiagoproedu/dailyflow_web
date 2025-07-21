import React from 'react';

function TasksPage() {
  // Dados de exemplo para as tarefas
  const tasks = [
    { id: 1, text: 'Finalizar relatório semanal', completed: false, priority: 'alta' },
    { id: 2, text: 'Agendar reunião com equipe de design', completed: false, priority: 'media' },
    { id: 3, text: 'Revisar documentação da API', completed: true, priority: 'baixa' },
    { id: 4, text: 'Responder e-mails pendentes', completed: false, priority: 'media' },
    { id: 5, text: 'Planejar próximo sprint', completed: false, priority: 'alta' },
  ];

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baixa': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="page-container tasks-page">
      <div className="tasks-header">
        <h1 className="page-title">Tarefas</h1>
        <button className="btn btn-primary add-task-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar Tarefa
        </button>
      </div>

      <div className="task-list-container">
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-item-content">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  readOnly 
                  className="task-checkbox"
                />
                <span className="task-text">{task.text}</span>
              </div>
              <div className="task-item-details">
                <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <button className="task-action-button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TasksPage;