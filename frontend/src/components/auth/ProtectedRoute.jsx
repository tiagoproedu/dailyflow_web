import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar'; // Importe a Sidebar
import Header from '../layout/Header';   // Importe o Header
import { useState } from 'react';

// Este componente vai renderizar o layout principal do app (Header + Sidebar + Conteúdo)
// Apenas para usuários autenticados.
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app-container">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-layout">
        <Sidebar isOpen={sidebarOpen} />
        <Outlet /> {/* O <Outlet /> é onde a página atual (ex: /dashboard) será renderizada */}
      </div>
    </div>
  );
};


function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // 1. Se ainda estivermos a verificar a autenticação, não mostramos nada (ou um spinner)
  if (isLoading) {
    return <div>Carregando...</div>; // Ou um componente de loading mais bonito
  }

  // 2. Se não houver usuário, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 3. Se houver um usuário, renderiza o layout principal do aplicativo
  return <AppLayout />;
}

export default ProtectedRoute;