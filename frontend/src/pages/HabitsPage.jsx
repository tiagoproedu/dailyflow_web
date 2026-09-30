// src/pages/HabitsPage.jsx
import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import Celebracao from '../components/ui/Celebracao';
import ProgressoDoHabito from '../components/habits/ProgressoDoHabito';
import apiClient from '../services/api';
import { buildIntention } from '../utils/intention';
import { chaveDoDia } from '../utils/datas';
import { useMenuAberto } from '../hooks/useMenuAberto';
import {
  reconhecerMarcacao,
  resumoDaSequencia,
  vibrar,
  PADRAO_MARCO,
  PADRAO_NORMAL,
} from '../utils/celebracao';

// Ícones
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


function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [openMenuId, setOpenMenuId] = useMenuAberto();
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  // Hábitos com uma marcação a caminho do servidor: um segundo toque rápido
  // desfazia o primeiro antes de a tela mostrar o resultado.
  const [marcando, setMarcando] = useState(() => new Set());
  const [celebracao, setCelebracao] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cue: '',
    cueTime: '',
    intrinsic: false,
  });

  // Busca os hábitos ao carregar a página
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await apiClient('/habits');
        setHabits(data);
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar os hábitos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHabits();
  }, []);

  // O dia de hoje no calendário local. Calculado a cada render (é barato) para não
  // ficar preso a ontem quando o app atravessa a meia-noite aberto.
  const todayString = chaveDoDia();

  // Verifica se o hábito foi completado hoje
  const isCompletedToday = (habit) => {
    return habit.completions?.some(
      (comp) => comp.date.split('T')[0] === todayString
    );
  };

  const openAddHabitModal = () => {
    setEditingHabit(null);
    setFormData({ name: '', category: '', cue: '', cueTime: '', intrinsic: false });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditHabitModal = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      category: habit.category || '',
      cue: habit.cue || '',
      cueTime: habit.cueTime || '',
      intrinsic: habit.intrinsic || false,
    });
    setFormError(null);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Prévia ao vivo da frase enquanto o utilizador escreve o gatilho
  const intentionPreview = buildIntention({
    name: formData.name || '...',
    cue: formData.cue,
    cueTime: formData.cueTime,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setFormError(null);
    const method = editingHabit ? 'PATCH' : 'POST';
    const endpoint = editingHabit ? `/habits/${editingHabit.id}` : '/habits';

    try {
      const result = await apiClient(endpoint, method, formData);
      if (editingHabit) {
        setHabits(prev => prev.map(h => (h.id === editingHabit.id ? result : h)));
      } else {
        setHabits(prev => [result, ...prev]);
      }
      closeModal();
    } catch (error) {
      // Antes isto só ia para o console: o formulário simplesmente não reagia e
      // quem estava do outro lado ficava sem saber se salvou ou não.
      setFormError(error.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Tem a certeza de que deseja apagar este hábito?')) {
      try {
        await apiClient(`/habits/${habitId}`, 'DELETE');
        setHabits(prev => prev.filter(h => h.id !== habitId));
      } catch (error) {
        setErro(error.message || 'Não foi possível apagar o hábito.');
      }
    }
  };
  
  const handleToggleHabit = async (habitId) => {
    if (marcando.has(habitId)) return;
    setMarcando(prev => new Set(prev).add(habitId));
    setErro(null);

    try {
      const resultado = await apiClient(`/habits/${habitId}/toggle-completion`, 'POST');

      if (resultado.completed) {
        const reconhecimento = reconhecerMarcacao(resultado.estatisticas);
        vibrar(reconhecimento.marco ? PADRAO_MARCO : PADRAO_NORMAL);
        setCelebracao({ ...reconhecimento, id: Date.now() });
      } else {
        setCelebracao(null);
      }

      // Atualiza o estado local para uma resposta visual imediata. As conclusões são
      // simuladas (só o dia de hoje muda), mas a sequência vem do servidor — é ela que
      // aparece escrita, e um número na tela não pode ser um palpite do navegador.
      // A data simulada segue o formato que o servidor devolve para uma coluna `Date`
      // ("AAAA-MM-DDT00:00:00.000Z"). Com `new Date().toISOString()`, marcar depois das
      // 21:00 gravava o dia seguinte e o checkbox desmarcava-se sozinho.
      setHabits(currentHabits =>
        currentHabits.map(h => {
          if (h.id !== habitId) return h;

          const newCompletions = resultado.completed
            ? [...(h.completions || []), { date: `${todayString}T00:00:00.000Z` }]
            : (h.completions || []).filter(c => c.date.split('T')[0] !== todayString);

          return { ...h, completions: newCompletions, estatisticas: resultado.estatisticas };
        })
      );
    } catch (error) {
      setErro(error.message || 'Não foi possível marcar o hábito.');
    } finally {
      setMarcando(prev => {
        const proximo = new Set(prev);
        proximo.delete(habitId);
        return proximo;
      });
    }
  };

  return (
    <div className="page-container habits-page">
      <div className="page-header-custom">
        <h1 className="page-title">Meus Hábitos</h1>
        <button
          type="button"
          className="btn btn-primary add-habit-button"
          onClick={openAddHabitModal}
          aria-label="Adicionar hábito"
        >
          <PlusIcon />
          <span className="rotulo-botao">Adicionar Hábito</span>
        </button>
      </div>

      <Celebracao mensagem={celebracao} aoFechar={() => setCelebracao(null)} />

      {erro && <p className="form-error" role="alert">{erro}</p>}

      {habits.length > 0 && (
        <p className="habits-nota">
          66 repetições é a <strong>média</strong> para um hábito virar automático — a faixa
          real observada vai de 18 a 254 dias. A sequência tolera uma falha por semana.
        </p>
      )}

      <div className="habit-list-container card">
        {isLoading ? (
          <p className="estado-vazio" role="status">A carregar hábitos…</p>
        ) : habits.length === 0 ? (
          <p className="estado-vazio">
            Nenhum hábito ainda. Comece por um só — o pequeno é o que gruda.
          </p>
        ) : (
          <ul className="habit-list">
            {habits.map(habit => (
              <li key={habit.id} className="habit-item task-item">
                <div className="habit-item-content task-item-content">
                  {/* O <label> nomeia o checkbox para o leitor de tela e transforma
                      o nome do hábito em área de toque. A frase do gatilho fica de
                      fora: é informação, não deve marcar o hábito sem querer. */}
                  <div className="habit-cabecalho">
                    <label className="item-toggle">
                      <input
                        type="checkbox"
                        checked={isCompletedToday(habit)}
                        disabled={marcando.has(habit.id)}
                        onChange={() => handleToggleHabit(habit.id)}
                        className="task-checkbox"
                      />
                      <span className="habit-name task-text">{habit.name}</span>
                    </label>
                    {/* Fica fora do <label> de propósito: tocar na sequência não pode
                        marcar o hábito sem querer. */}
                    {resumoDaSequencia(habit.estatisticas) && (
                      <span className="habit-streak">{resumoDaSequencia(habit.estatisticas)}</span>
                    )}
                  </div>
                  {buildIntention(habit) ? (
                    <p className="habit-intention">{buildIntention(habit)}</p>
                  ) : (
                    <p className="habit-intention habit-intention-missing">
                      Sem gatilho definido — edite e responda &quot;quando?&quot;
                    </p>
                  )}
                  <ProgressoDoHabito estatisticas={habit.estatisticas} />
                </div>
                <div className="habit-item-details task-item-details">
                  {habit.category && <span className="habit-category">{habit.category}</span>}
                  <div className="task-actions-menu">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === habit.id ? null : habit.id)}
                      className="task-action-button"
                      aria-label={`Ações do hábito ${habit.name}`}
                      aria-expanded={openMenuId === habit.id}
                    >
                      <DotsIcon />
                    </button>
                    <div className={`task-actions-dropdown ${openMenuId === habit.id ? 'open' : ''}`}>
                      <button type="button" onClick={() => openEditHabitModal(habit)}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                         </svg>
                        Editar
                      </button>
                      <button type="button" onClick={() => handleDeleteHabit(habit.id)} className="delete">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
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
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-group">
                <label htmlFor="name" className="rotulo-campo">Nome do Hábito (Obrigatório)</label>
                <input
                    type="text" id="name" name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="campo-texto"
                />
            </div>
            <div className="form-group">
                <label htmlFor="category" className="rotulo-campo">Categoria</label>
                <input
                    type="text" id="category" name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="campo-texto"
                />
            </div>

            <div className="intention-block">
                <h3 className="intention-title">Quando você vai fazer isso?</h3>
                <p className="intention-help">
                    Ligar o hábito a um gatilho concreto que já existe no seu dia é o que mais
                    aumenta a chance de ele pegar — mais do que força de vontade.
                </p>

                <div className="form-group">
                    <label htmlFor="cue" className="rotulo-campo">
                        Quando eu... <span className="rotulo-dica">(ex: terminar o café da manhã)</span>
                    </label>
                    <input
                        type="text" id="cue" name="cue"
                        value={formData.cue}
                        onChange={handleInputChange}
                        placeholder="terminar o café da manhã"
                        className="campo-texto"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="cueTime" className="rotulo-campo">
                        Horário aproximado <span className="rotulo-dica">(opcional)</span>
                    </label>
                    <input
                        type="time" id="cueTime" name="cueTime"
                        value={formData.cueTime}
                        onChange={handleInputChange}
                        className="campo-texto campo-hora"
                    />
                </div>

                {intentionPreview && (
                    <p className="intention-preview">{intentionPreview}</p>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="intrinsic" className="campo-opcao">
                    <input
                        type="checkbox" id="intrinsic" name="intrinsic"
                        checked={formData.intrinsic}
                        onChange={handleInputChange}
                    />
                    <span>
                        Eu já faço isso por gosto
                        <span className="campo-ajuda">
                            O app não vai dar pontos por este hábito. Premiar o que você já gosta
                            de fazer costuma diminuir o prazer de fazer.
                        </span>
                    </span>
                </label>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                    {enviando ? 'Salvando…' : editingHabit ? 'Salvar Alterações' : 'Salvar Hábito'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}

export default HabitsPage;