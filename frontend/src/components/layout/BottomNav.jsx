// src/components/layout/BottomNav.jsx
//
// A navegação do celular. Existe porque a gaveta abria por um botão no canto superior
// esquerdo — o ponto mais difícil de alcançar com o polegar de quem segura o telemóvel
// com uma mão só, que é como este app é usado. Aqui os cinco destinos ficam sempre
// visíveis, na faixa inferior, ao alcance do dedo.
//
// No desktop ela desaparece: lá a barra lateral já mostra os mesmos itens.

import { NavLink } from 'react-router-dom';
import { ITENS_DE_MENU, ICONES } from './navegacao';

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <ul>
        {ITENS_DE_MENU.map((item) => (
          <li key={item.url}>
            <NavLink to={item.url} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <span className="bottom-nav-icone" aria-hidden="true">{ICONES[item.icone]}</span>
              <span className="bottom-nav-texto">{item.nome}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default BottomNav;
