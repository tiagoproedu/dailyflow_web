import { useAuth } from '../../context/AuthContext';

function Header({ onMenuClick, isMenuOpen }) {
  const { user } = useAuth();
  // Era "US" fixo no código. A inicial vem do nome de quem entrou.
  const inicial = user?.name?.trim().charAt(0).toUpperCase() || '?';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {/* Botão só com ícone precisa de aria-label, senão o leitor de tela
              anuncia apenas "botão". O aria-expanded diz se a gaveta está aberta. */}
          <button
            type="button"
            onClick={onMenuClick}
            className="menu-button"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            aria-controls="menu-lateral"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="header-title">DailyFlow</h1>
        </div>

        <div className="header-right">
          {/* O sino de notificações saiu: não existem lembretes ainda, e um botão
              que não faz nada promete uma coisa que o app não cumpre. */}
          <div className="user-avatar" title={user?.name}>
            <span aria-hidden="true">{inicial}</span>
            <span className="sr-only">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
   )
}

export default Header
