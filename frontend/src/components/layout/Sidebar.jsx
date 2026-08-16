import { NavLink } from "react-router-dom"
import { ITENS_DE_MENU, ICONES } from "./navegacao"

function Sidebar({ isOpen, onNavigate, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`} id="menu-lateral">
      <div className="sidebar-content">
        <div className="sidebar-menu-title">
          <h2>Menu</h2>
          {/* Só aparece no celular: no desktop a barra é fixa e não fecha. */}
          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Menu principal">
          <ul>
            {ITENS_DE_MENU.map((item) => (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={onNavigate}
                >
                  {/* Os ícones são decorativos: o texto ao lado já diz tudo. */}
                  <span aria-hidden="true">{ICONES[item.icone]}</span>
                  {item.nome}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
