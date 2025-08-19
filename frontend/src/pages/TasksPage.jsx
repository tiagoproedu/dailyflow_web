import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import apiClient from '../services/api';

function TasksPage() {
  // Estado para armazenar as tarefas
  const [tasks, setTasks] = useState([]);
  // Estado para guardar a terefa que será editada
  const [editingTask, setEditingTask] = useState(null);
  // Estado para controlar se o modal está aberto ou fechado
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para o menu de tarefa que está aberto
  const [openMenuId, setOpenMenuId] = useState(null);
  // Estado para armazenar os dados da nova tarefa
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    priority: 'baixa',
  });

// Efeito para buscar as tarefas ao carregar a página
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await apiClient('/tasks');
        setTasks(data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
      }
    };
    fetchTasks();
  }, []);

  // Função para atualizar status
const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const updatedTask = await apiClient(`/tasks/${taskId}`, 'PATCH', { completed: !currentStatus });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar a tarefa:', error);
    }
  };

  // Função para deletar tarefas
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Tem certeza que deseja excluir essa tarefa?')) {
      try {
        await apiClient(`/tasks/${taskId}`, 'DELETE');
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Erro ao deletar a tarefa:', error);
      }
    }
  };

  //Função para lidar com mudanças nos textos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setFormData({ text: '', description: '', priority: 'baixa' });
    setIsModalOpen(true);
  }

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setFormData({
      text: task.text,
      description: task.description || '',
      priority: task.priority,
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Função para enviar o formulário para a API
const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingTask) {
      try {
        const updatedTask = await apiClient(`/tasks/${editingTask.id}`, 'PATCH', formData);
        setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? updatedTask : t));
        closeModal();
      } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
      }
    } else {
      try {
        const createdTask = await apiClient('/tasks', 'POST', formData);
        setTasks(prevTasks => [createdTask, ...prevTasks]);
        closeModal();
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
      }
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
        <button className="btn btn-primary add-task-button" onClick={openAddTaskModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar Tarefa
        </button>
      </div>

      <div className="task-list-container">
        {tasks.length === 0 ? (
          <p style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>
            Nenhuma tarefa encontrada. Que tal adicionar uma nova?
          </p>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-item-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                    className="task-checkbox"
                  />
                  <span className="task-text">{task.text}</span>
                </div>
                <div className="task-item-details">
                  <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <div className="task-actions-menu">
                  <button onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)} className="task-action-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </button>
                  <div className={`task-actions-dropdown ${openMenuId === task.id ? 'open' : ''}`}>
                    <button onClick={() => openEditTaskModal(task)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="delete">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.718c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Apagar
                    </button>
                  </div>
                </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal title={editingTask ? "Editar Tarefa" : "Adicionar Nova Tarefa"} isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="text" style={{ display: 'block', marginBottom: '0.5rem' }}>Tarefa (Obrigatório)</label>
            <input
              type="text" id="text" name="text"
              value={formData.text}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição</label>
            <textarea
              id="description" name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            ></textarea>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="priority" style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridade</label>
            <select
              id="priority" name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="form-actions" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Salvar Alterações' : 'Salvar Tarefa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TasksPage;