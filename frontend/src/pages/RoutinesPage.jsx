// src/pages/RoutinesPage.jsx
import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import apiClient from '../services/api';

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

const EMPTY_FORM = {
  name: '',
  description: '',
  timeOfDay: 'Manhã',
  tasks: [''],
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--neutral-gray-medium)',
};

function RoutinesPage() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Busca as rotinas ao carregar a página
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await apiClient('/routines');
        setRoutines(data);
      } catch (error) {
        console.error('Erro ao buscar rotinas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  const openAddRoutineModal = () => {
    setEditingRoutine(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditRoutineModal = (routine) => {
    setEditingRoutine(routine);
    setFormData({
      name: routine.name,
      description: routine.description || '',
      timeOfDay: routine.timeOfDay,
      // Na edição as tarefas são geridas uma a uma, por isso o formulário só trata dos dados da rotina
      tasks: [],
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // --- Campos dinâmicos das tarefas (apenas na criação) ---
  const handleTaskChange = (index, value) => {
    setFormData(prevState => ({
      ...prevState,
      tasks: prevState.tasks.map((task, i) => (i === index ? value : task)),
    }));
  };

  const addTaskField = () => {
    setFormData(prevState => ({ ...prevState, tasks: [...prevState.tasks, ''] }));
  };

  const removeTaskField = (index) => {
    setFormData(prevState => ({
      ...prevState,
      tasks: prevState.tasks.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingRoutine ? 'PATCH' : 'POST';
    const endpoint = editingRoutine ? `/routines/${editingRoutine.id}` : '/routines';

    try {
      const result = await apiClient(endpoint, method, formData);
      if (editingRoutine) {
        setRoutines(routines.map(r => (r.id === editingRoutine.id ? result : r)));
      } else {
        setRoutines([...routines, result]);
      }
      closeModal();
    } catch (error) {
      console.error(`Erro ao ${editingRoutine ? 'atualizar' : 'criar'} rotina:`, error);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm('Tem a certeza de que deseja apagar esta rotina?')) {
      try {
        await apiClient(`/routines/${routineId}`, 'DELETE');
        setRoutines(routines.filter(r => r.id !== routineId));
        setOpenMenuId(null);
      } catch (error) {
        console.error('Erro ao apagar rotina:', error);
      }
    }
  };

  const handleToggleActive = async (routine) => {
    try {
      const result = await apiClient(`/routines/${routine.id}`, 'PATCH', { active: !routine.active });
      setRoutines(routines.map(r => (r.id === routine.id ? result : r)));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erro ao ativar/desativar rotina:', error);
    }
  };

  // Copia as tarefas-modelo da rotina para as tarefas reais de hoje
  const handleStartRoutine = async (routine) => {
    try {
      const result = await apiClient(`/routines/${routine.id}/start`, 'POST');
      setFeedback(
        result.alreadyStarted
          ? `"${routine.name}" já tinha sido iniciada hoje.`
          : `${result.tasks.length} tarefa(s) de "${routine.name}" foram para a sua lista de hoje.`
      );
    } catch (error) {
      setFeedback(error.message);
    }
  };

  const handleAddTaskToRoutine = async (routine, text) => {
    try {
      const task = await apiClient(`/routines/${routine.id}/tasks`, 'POST', { text });
      setRoutines(routines.map(r => (
        r.id === routine.id ? { ...r, templateTasks: [...r.templateTasks, task] } : r
      )));
    } catch (error) {
      console.error('Erro ao adicionar tarefa à rotina:', error);
    }
  };

  const handleRemoveTaskFromRoutine = async (routine, taskId) => {
    try {
      await apiClient(`/routines/${routine.id}/tasks/${taskId}`, 'DELETE');
      setRoutines(routines.map(r => (
        r.id === routine.id
          ? { ...r, templateTasks: r.templateTasks.filter(t => t.id !== taskId) }
          : r
      )));
    } catch (error) {
      console.error('Erro ao remover tarefa da rotina:', error);
    }
  };

  return (
    <div className="page-container routines-page">
      <div className="page-header-custom">
        <h1 className="page-title">Minhas Rotinas</h1>
        <button
          className="btn btn-primary add-routine-button"
          onClick={openAddRoutineModal}
          aria-label="Criar rotina"
        >
          <PlusIcon />
          <span className="rotulo-botao">Criar Rotina</span>
        </button>
      </div>

      {feedback && (
        <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span role="status">{feedback}</span>
          <button className="btn btn-outline btn-xs" onClick={() => setFeedback(null)}>Fechar</button>
        </div>
      )}

      {isLoading ? (
        <p role="status" style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>A carregar rotinas…</p>
      ) : routines.length === 0 ? (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>
          Nenhuma rotina ainda. Crie a sua primeira rotina matinal ou noturna!
        </div>
      ) : (
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
                  <div className="task-actions-menu">
                    <button
                      type="button"
                      className="routine-action-button task-action-button"
                      onClick={() => setOpenMenuId(openMenuId === routine.id ? null : routine.id)}
                      aria-label={`Ações da rotina ${routine.name}`}
                      aria-expanded={openMenuId === routine.id}
                    >
                      <DotsIcon />
                    </button>
                    <div className={`task-actions-dropdown ${openMenuId === routine.id ? 'open' : ''}`}>
                      <button onClick={() => openEditRoutineModal(routine)}>Editar</button>
                      <button onClick={() => handleToggleActive(routine)}>
                        {routine.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => handleDeleteRoutine(routine.id)} className="delete">Apagar</button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="routine-time">{routine.timeOfDay}</p>
              <p className="routine-description">{routine.description}</p>

              <div className="routine-tasks-preview">
                <h3 className="preview-title">Tarefas Principais:</h3>
                {routine.templateTasks.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Sem tarefas — abra os detalhes para adicionar.</p>
                ) : (
                  <ul>
                    {(expandedId === routine.id ? routine.templateTasks : routine.templateTasks.slice(0, 3)).map(task => (
                      <li key={task.id}>
                        {task.text}
                        {expandedId === routine.id && (
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ marginLeft: '0.5rem' }}
                            onClick={() => handleRemoveTaskFromRoutine(routine, task.id)}
                          >
                            remover
                          </button>
                        )}
                      </li>
                    ))}
                    {expandedId !== routine.id && routine.templateTasks.length > 3 && <li>... e mais</li>}
                  </ul>
                )}

                {expandedId === routine.id && (
                  <form
                    style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = e.target.elements.newTask.value.trim();
                      if (!text) return;
                      handleAddTaskToRoutine(routine, text);
                      e.target.reset();
                    }}
                  >
                    <input name="newTask" placeholder="Nova tarefa da rotina" style={{ ...inputStyle, padding: '0.5rem' }} />
                    <button type="submit" className="btn btn-primary btn-xs">Adicionar</button>
                  </form>
                )}
              </div>

              <div className="routine-card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                >
                  {expandedId === routine.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </button>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => handleStartRoutine(routine)}
                  disabled={routine.templateTasks.length === 0}
                >
                  Iniciar hoje
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title={editingRoutine ? 'Editar Rotina' : 'Criar Nova Rotina'} isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nome da Rotina (Obrigatório)</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="timeOfDay" style={{ display: 'block', marginBottom: '0.5rem' }}>Período do Dia</label>
            <select
              id="timeOfDay" name="timeOfDay"
              value={formData.timeOfDay}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição</label>
            <input
              type="text" id="description" name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          {!editingRoutine && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tarefas da Rotina</label>
              {formData.tasks.map((task, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={`Tarefa ${index + 1}`}
                    style={inputStyle}
                  />
                  {formData.tasks.length > 1 && (
                    <button type="button" className="btn btn-outline btn-xs" onClick={() => removeTaskField(index)}>
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-xs" onClick={addTaskField}>
                + Adicionar tarefa
              </button>
            </div>
          )}

          <div className="form-actions" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">
              {editingRoutine ? 'Salvar Alterações' : 'Salvar Rotina'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RoutinesPage;
