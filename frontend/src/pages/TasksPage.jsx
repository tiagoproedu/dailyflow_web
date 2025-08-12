import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';

function TasksPage() {
  // Estado para armazenar as tarefas
  const [tasks, setTasks] = useState([]);
  // Estado para controlar se o modal está aberto ou fechado
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para armazenar os dados da nova tarefa
  const [newTask, setNewTask] = useState({
    text: '',
    description: '',
    priority: 'baixa',
  });

// Efeito para buscar as tarefas ao carregar a página
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
      }
    };
    fetchTasks();
  }, []);

  //Função para lidar com mudanças nos textos do formulário
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setNewTask(prevState => ({...prevState, [name]: value}));
  };

  // Função para enviar o formulário para a API
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar tarefa');
      }

      const createdTask = await response.json();

      // Adiciona a nova tarefa ao início da lista
      setTasks(prevTasks => [createdTask, ...prevTasks]);

      // Limpa o formulário e fecha o modal
      setNewTask({text: '', description: '', priority: 'baixa'});
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao submeter a tarefa:', error);
    }
  };

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
        <button className="btn btn-primary add-task-button" onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar Tarefa
        </button>
      </div>

      <div className="task-list-container">
        {tasks.length === 0 ? (
          <p style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>
            Nenhuma tarefa encontrada. Que tal adicionar uma nova ?
          </p>
        ) : (
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
        )}
      </div>

      <Modal title="Adicionar Nova Tarefa" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="text" style={{ display: 'block', marginBottom: '0.5rem' }}>Tarefa (Obrigatório)</label>
            <input
              type="text"
              id="text"
              name="text"
              value={newTask.text}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              rows="3"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            ></textarea>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="priority" style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridade</label>
            <select
              id="priority"
              name="priority"
              value={newTask.priority}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="form-actions" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">Salvar Tarefa</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TasksPage;