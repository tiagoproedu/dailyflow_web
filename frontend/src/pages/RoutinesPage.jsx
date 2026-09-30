// src/pages/RoutinesPage.jsx
import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import apiClient from '../services/api';
import { useMenuAberto } from '../hooks/useMenuAberto';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const DotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-xs" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188a2.25 2.25 0 00-1.75-1.75L12 9l2.188-1.25a2.25 2.25 0 001.75-1.75L17 3.813l1.25 2.188a2.25 2.25 0 001.75 1.75L22.188 9l-2.188 1.25a2.25 2.25 0 00-1.75 1.75z" />
  </svg>
);

const EMPTY_FORM = {
  name: '',
  description: '',
  timeOfDay: 'Manhã',
  tasks: [''],
};

function RoutinesPage() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [openMenuId, setOpenMenuId] = useMenuAberto();
  const [expandedId, setExpandedId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [erro, setErro] = useState(null);
  const [formError, setFormError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Busca as rotinas ao carregar a página
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await apiClient('/routines');
        setRoutines(data);
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar as rotinas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  const openAddRoutineModal = () => {
    setEditingRoutine(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
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
    setFormError(null);
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
    if (enviando) return;
    setEnviando(true);
    setFormError(null);
    const method = editingRoutine ? 'PATCH' : 'POST';
    const endpoint = editingRoutine ? `/routines/${editingRoutine.id}` : '/routines';

    try {
      const result = await apiClient(endpoint, method, formData);
      if (editingRoutine) {
        setRoutines(prev => prev.map(r => (r.id === editingRoutine.id ? result : r)));
      } else {
        setRoutines(prev => [...prev, result]);
      }
      closeModal();
    } catch (error) {
      // Antes só ia para o console: o modal ficava aberto sem explicação.
      setFormError(error.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm('Tem a certeza de que deseja apagar esta rotina?')) {
      try {
        await apiClient(`/routines/${routineId}`, 'DELETE');
        setRoutines(prev => prev.filter(r => r.id !== routineId));
        setOpenMenuId(null);
      } catch (error) {
        setErro(error.message || 'Não foi possível apagar a rotina.');
      }
    }
  };

  const handleToggleActive = async (routine) => {
    try {
      const result = await apiClient(`/routines/${routine.id}`, 'PATCH', { active: !routine.active });
      setRoutines(prev => prev.map(r => (r.id === routine.id ? result : r)));
      setOpenMenuId(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível ativar/desativar a rotina.');
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
      setRoutines(prev => prev.map(r => (
        r.id === routine.id ? { ...r, templateTasks: [...r.templateTasks, task] } : r
      )));
    } catch (error) {
      setErro(error.message || 'Não foi possível adicionar a tarefa à rotina.');
    }
  };

  const handleRemoveTaskFromRoutine = async (routine, taskId) => {
    try {
      await apiClient(`/routines/${routine.id}/tasks/${taskId}`, 'DELETE');
      setRoutines(prev => prev.map(r => (
        r.id === routine.id
          ? { ...r, templateTasks: r.templateTasks.filter(t => t.id !== taskId) }
          : r
      )));
    } catch (error) {
      setErro(error.message || 'Não foi possível remover a tarefa da rotina.');
    }
  };

  return (
    <div className="page-container routines-page">
      <div className="page-header-custom">
        <h1 className="page-title">Minhas Rotinas</h1>
        <button
          type="button"
          className="btn btn-primary add-routine-button"
          onClick={openAddRoutineModal}
          aria-label="Criar rotina"
        >
          <PlusIcon />
          <span className="rotulo-botao">Criar Rotina</span>
        </button>
      </div>

      {feedback && (
        <div className="aviso-fechavel">
          <span role="status">{feedback}</span>
          <button type="button" className="btn btn-outline btn-xs" onClick={() => setFeedback(null)}>Fechar</button>
        </div>
      )}

      {erro && <p className="form-error" role="alert">{erro}</p>}

      {isLoading ? (
        <p className="estado-vazio" role="status">A carregar rotinas…</p>
      ) : routines.length === 0 ? (
        <div className="card estado-vazio">
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
                      <button type="button" onClick={() => openEditRoutineModal(routine)}>Editar</button>
                      <button type="button" onClick={() => handleToggleActive(routine)}>
                        {routine.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button type="button" onClick={() => handleDeleteRoutine(routine.id)} className="delete">Apagar</button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="routine-time">
                {routine.timeOfDay}
                {!routine.active && <span className="routine-inativa"> · desativada</span>}
              </p>
              {routine.description && <p className="routine-description">{routine.description}</p>}

              <div className="routine-tasks-preview">
                <h3 className="preview-title">Tarefas Principais:</h3>
                {routine.templateTasks.length === 0 ? (
                  <p className="texto-apoio">Sem tarefas — abra os detalhes para adicionar.</p>
                ) : (
                  <ul>
                    {(expandedId === routine.id ? routine.templateTasks : routine.templateTasks.slice(0, 3)).map(task => (
                      <li key={task.id}>
                        <span>{task.text}</span>
                        {expandedId === routine.id && (
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            aria-label={`Remover ${task.text}`}
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
                    className="linha-campo"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = e.target.elements.newTask.value.trim();
                      if (!text) return;
                      handleAddTaskToRoutine(routine, text);
                      e.target.reset();
                    }}
                  >
                    <input
                      name="newTask"
                      placeholder="Nova tarefa da rotina"
                      aria-label="Nova tarefa da rotina"
                      className="campo-texto"
                    />
                    <button type="submit" className="btn btn-primary btn-xs">Adicionar</button>
                  </form>
                )}
              </div>

              <div className="routine-card-footer">
                <button
                  type="button"
                  aria-expanded={expandedId === routine.id}
                  className="btn btn-outline btn-xs"
                  onClick={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                >
                  {expandedId === routine.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </button>
                <button
                  type="button"
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
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="form-group">
            <label htmlFor="name" className="rotulo-campo">Nome da Rotina (Obrigatório)</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="campo-texto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeOfDay" className="rotulo-campo">Período do Dia</label>
            <select
              id="timeOfDay" name="timeOfDay"
              value={formData.timeOfDay}
              onChange={handleInputChange}
              className="campo-texto"
            >
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="rotulo-campo">Descrição</label>
            <input
              type="text" id="description" name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="campo-texto"
            />
          </div>

          {!editingRoutine && (
            <fieldset className="form-group">
              <legend className="rotulo-campo">Tarefas da Rotina</legend>
              {formData.tasks.map((task, index) => (
                <div key={index} className="linha-campo">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={`Tarefa ${index + 1}`}
                    aria-label={`Tarefa ${index + 1}`}
                    className="campo-texto"
                  />
                  {formData.tasks.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      aria-label={`Remover tarefa ${index + 1}`}
                      onClick={() => removeTaskField(index)}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-xs" onClick={addTaskField}>
                + Adicionar tarefa
              </button>
            </fieldset>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Salvando…' : editingRoutine ? 'Salvar Alterações' : 'Salvar Rotina'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RoutinesPage;
