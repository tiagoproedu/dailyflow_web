import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import BottomNav from '../layout/BottomNav';
import { useEffect, useState } from 'react';

// Este componente vai renderizar o layout principal do app (Header + Sidebar + Conteúdo)
// Apenas para usuários autenticados.
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Ao trocar de página no celular, a gaveta tem de sair da frente sozinha.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
      />
      <div className="main-layout">
        <Sidebar
          isOpen={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* O <main> mora aqui, e não em cada página, para que toda rota tenha a
            marcação de "conteúdo principal" e o link de pular tenha um destino
            fixo. O tabIndex=-1 é o que faz o foco realmente saltar para cá. */}
        <main className="main-content" id="conteudo" tabIndex={-1}>
          <Outlet /> {/* O <Outlet /> é onde a página atual (ex: /dashboard) será renderizada */}
        </main>
      </div>
      {/* Só aparece no celular; no desktop a barra lateral já faz este papel. */}
      <BottomNav />
    </div>
  );
};


function ProtectedRoute() {
  const { user } = useAuth();

  // 1. Se não houver usuário, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se houver um usuário, renderiza o layout principal do aplicativo
  return <AppLayout />;
}

export default ProtectedRoute;
