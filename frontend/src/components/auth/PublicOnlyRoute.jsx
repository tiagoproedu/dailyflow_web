import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Início, login e registo não fazem sentido para quem já entrou: abrir o app
// instalado caía na tela de boas-vindas em vez do dia de hoje.
function PublicOnlyRoute() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
