import React from 'react';

// Ícone de exemplo para "Editar"
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="button-icon-sm">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);


function ProfilePage() {
  // Dados de exemplo do usuário
  const userProfile = {
    name: 'Usuário DailyFlow',
    email: 'usuario@dailyflow.app',
    memberSince: 'Maio, 2024',
    avatarInitial: 'U', // Para o avatar
    stats: {
      habitsCompleted: 125,
      longestStreak: 32, // em dias
      routinesFollowed: 48
    },
    preferences: {
      darkMode: false,
      emailNotifications: true,
    },
    subscription: {
      plan: 'Premium',
      nextBillingDate: '30 de Junho, 2025'
    }
  };

  return (
    <div className="page-container profile-page">
      <div className="page-header-custom">
        <h1 className="page-title">Meu Perfil</h1>
        {/* Pode haver um botão geral de "Salvar Alterações" se a página for editável diretamente */}
      </div>

      <div className="profile-sections-grid">
        {/* Seção de Informações Pessoais */}
        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Informações Pessoais</h2>
            <button className="btn btn-outline btn-xs edit-section-button">
              <EditIcon /> Editar
            </button>
          </div>
          <div className="profile-avatar-large">
            <span>{userProfile.avatarInitial}</span>
          </div>
          <div className="profile-info-item">
            <strong>Nome:</strong> <span>{userProfile.name}</span>
          </div>
          <div className="profile-info-item">
            <strong>Email:</strong> <span>{userProfile.email}</span>
          </div>
          <div className="profile-info-item">
            <strong>Membro desde:</strong> <span>{userProfile.memberSince}</span>
          </div>
        </div>

        {/* Seção de Estatísticas */}
        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Minhas Estatísticas</h2>
          </div>
          <div className="profile-info-item">
            <strong>Hábitos Concluídos:</strong> <span>{userProfile.stats.habitsCompleted}</span>
          </div>
          <div className="profile-info-item">
            <strong>Maior Sequência (Streak):</strong> <span>{userProfile.stats.longestStreak} dias</span>
          </div>
          <div className="profile-info-item">
            <strong>Rotinas Seguidas:</strong> <span>{userProfile.stats.routinesFollowed}</span>
          </div>
        </div>
        
        {/* Seção de Preferências do App */}
        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Preferências</h2>
            <button className="btn btn-outline btn-xs edit-section-button">
             <EditIcon /> Editar
            </button>
          </div>
          <div className="profile-info-item preference-item">
            <span>Modo Escuro:</span> 
            {/* Implementar um toggle switch aqui */}
            <span>{userProfile.preferences.darkMode ? 'Ativado' : 'Desativado'}</span>
          </div>
          <div className="profile-info-item preference-item">
            <span>Notificações por Email:</span>
            {/* Implementar um toggle switch aqui */}
            <span>{userProfile.preferences.emailNotifications ? 'Ativado' : 'Desativado'}</span>
          </div>
        </div>

        {/* Seção de Assinatura/Conta */}
        <div className="profile-section card">
          <div className="profile-section-header">
            <h2 className="section-title">Minha Conta</h2>
          </div>
          <div className="profile-info-item">
            <strong>Plano Atual:</strong> <span className="plan-badge">{userProfile.subscription.plan}</span>
          </div>
           <div className="profile-info-item">
            <strong>Próxima Cobrança:</strong> <span>{userProfile.subscription.nextBillingDate}</span>
          </div>
          <div className="profile-account-actions">
            <button className="btn btn-outline btn-xs">Alterar Senha</button>
            <button className="btn btn-outline btn-xs">Gerenciar Assinatura</button>
            <button className="btn btn-danger btn-xs">Excluir Conta</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;