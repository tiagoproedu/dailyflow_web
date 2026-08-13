// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import SecaoLembretes from '../components/profile/SecaoLembretes';

// Mostra a data como "Agosto de 2026" — o dia exato não interessa aqui.
const formatarMes = (iso) => {
  if (!iso) return '—';
  const data = new Date(iso);
  const mes = data.toLocaleDateString('pt-BR', { month: 'long' });
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} de ${data.getFullYear()}`;
};

function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        setPerfil(await apiClient('/profile'));
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarPerfil();
  }, []);

  const sair = () => {
    logout();
    navigate('/login');
  };

  if (carregando) {
    return (
      <div className="page-container profile-page">
        <h1 className="page-title">Meu Perfil</h1>
        <p role="status">A carregar o seu perfil…</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="page-container profile-page">
        <h1 className="page-title">Meu Perfil</h1>
        <p className="form-error" role="alert">{erro}</p>
      </div>
    );
  }

  const { name, email, avatarInitial, memberSince, stats } = perfil;

  return (
    <div className="page-container profile-page">
      <div className="page-header-custom">
        <h1 className="page-title">Meu Perfil</h1>
      </div>

      <div className="profile-sections-grid">
        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Informações Pessoais</h2>
          </div>
          <div className="profile-avatar-large" aria-hidden="true">
            <span>{avatarInitial}</span>
          </div>
          <div className="profile-info-item">
            <strong>Nome:</strong> <span>{name}</span>
          </div>
          <div className="profile-info-item">
            <strong>Email:</strong> <span>{email}</span>
          </div>
          <div className="profile-info-item">
            <strong>Membro desde:</strong> <span>{formatarMes(memberSince)}</span>
          </div>
        </div>

        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Minhas Estatísticas</h2>
          </div>
          <div className="profile-info-item">
            <strong>Hábitos marcados:</strong> <span>{stats.habitsCompleted}</span>
          </div>
          <div className="profile-info-item">
            <strong>Hábitos em curso:</strong> <span>{stats.activeHabits}</span>
          </div>
          <div className="profile-info-item">
            <strong>Tarefas concluídas:</strong> <span>{stats.tasksCompleted}</span>
          </div>
          <div className="profile-info-item">
            <strong>Rotinas ativas:</strong> <span>{stats.activeRoutines}</span>
          </div>
          {stats.habitsCompleted === 0 && (
            <p className="profile-vazio">
              Ainda sem marcações. Os números aparecem sozinhos conforme você usa o app.
            </p>
          )}
        </div>

        <SecaoLembretes habitosComHorario={stats.habitsWithReminder} />

        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Minha Conta</h2>
          </div>
          <div className="profile-account-actions">
            <button type="button" className="btn btn-outline" onClick={sair}>
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
