// src/pages/HabitsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/ui/Modal';
import apiClient from '../services/api';

// Ícones
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const DotsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
);


function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
  });

  // Busca os hábitos ao carregar a página
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await apiClient('/habits');
        setHabits(data);
      } catch (error) {
        console.error('Erro ao buscar hábitos:', error);
      }
    };
    fetchHabits();
  }, []);

  // Função para verificar se o hábito foi completado hoje
  const todayString = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }, []);

  // Verifica se o hábito foi completado hoje
  const isCompletedToday = (habit) => {
    return habit.completions?.some(
      (comp) => comp.date.split('T')[0] === todayString
    );
  };

  const openAddHabitModal = () => {
    setEditingHabit(null);
    setFormData({ name: '', category: '' });
    setIsModalOpen(true);
  };

  const openEditHabitModal = (habit) => {
    setEditingHabit(habit);
    setFormData({ name: habit.name, category: habit.category || '' });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingHabit ? 'PATCH' : 'POST';
    const endpoint = editingHabit ? `/habits/${editingHabit.id}` : '/habits';

    try {
      const result = await apiClient(endpoint, method, formData);
      if (editingHabit) {
        setHabits(habits.map(h => (h.id === editingHabit.id ? result : h)));
      } else {
        setHabits([result, ...habits]);
      }
      closeModal();
    } catch (error) {
      console.error(`Erro ao ${editingHabit ? 'atualizar' : 'criar'} hábito:`, error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Tem a certeza de que deseja apagar este hábito?')) {
      try {
        await apiClient(`/habits/${habitId}`, 'DELETE');
        setHabits(habits.filter(h => h.id !== habitId));
      } catch (error) {
        console.error('Erro ao apagar hábito:', error);
      }
    }
  };
  
  const handleToggleHabit = async (habitId) => {
    try {
      // Chama o novo endpoint
      await apiClient(`/habits/${habitId}/toggle-completion`, 'POST');

      // Atualiza o estado local para uma resposta visual imediata
      setHabits(currentHabits =>
        currentHabits.map(h => {
          if (h.id === habitId) {
            const completed = isCompletedToday(h);
            // Simula a adição/remoção da conclusão no estado
            const newCompletions = completed
              ? h.completions.filter(c => c.date.split('T')[0] !== todayString)
              : [...(h.completions || []), { date: new Date().toISOString() }];
            return { ...h, completions: newCompletions };
          }
          return h;
        })
      );
    } catch (error) {
      console.error('Erro ao marcar/desmarcar hábito:', error);
    }
  };

  return (
    <div className="page-container habits-page">
      <div className="page-header-custom">
        <h1 className="page-title">Meus Hábitos</h1>
        <button className="btn btn-primary add-habit-button" onClick={openAddHabitModal}>
          <PlusIcon />
          Adicionar Hábito
        </button>
      </div>

      <div className="habit-list-container card">
        {habits.length === 0 ? (
          <p style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>
            Nenhum hábito encontrado. Comece a construir uma rotina!
          </p>
        ) : (
          <ul className="habit-list">
            {habits.map(habit => (
              <li key={habit.id} className={`habit-item task-item`}> {/* Reutilizando task-item para consistência */}
                <div className="habit-item-content task-item-content"> {/* Reutilizando task-item-content */}
                  <input
                    type="checkbox"
                    checked={isCompletedToday(habit)} // Controlado pelo estado
                    onChange={() => handleToggleHabit(habit.id)}
                    className="task-checkbox"
                  />
                  <span className="habit-name task-text">{habit.name}</span> {/* Reutilizando task-text */}
                </div>
                <div className="habit-item-details task-item-details"> {/* Reutilizando task-item-details */}
                  <span className="habit-category">{habit.category}</span>
                  <div className="task-actions-menu">
                    <button onClick={() => setOpenMenuId(openMenuId === habit.id ? null : habit.id)} className="task-action-button">
                      <DotsIcon />
                    </button>
                    {/* **ALTERAÇÃO 2: Adicionamos os ícones SVG aos botões de ação** */}
                    <div className={`task-actions-dropdown ${openMenuId === habit.id ? 'open' : ''}`}>
                      <button onClick={() => openEditHabitModal(habit)}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                         </svg>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteHabit(habit.id)} className="delete">
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

      <Modal title={editingHabit ? "Editar Hábito" : "Adicionar Novo Hábito"} isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleFormSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nome do Hábito (Obrigatório)</label>
                <input
                    type="text" id="name" name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
                />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem' }}>Categoria</label>
                <input
                    type="text" id="category" name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
                />
            </div>
            <div className="form-actions" style={{ textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary">
                    {editingHabit ? 'Salvar Alterações' : 'Salvar Hábito'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}

export default HabitsPage;