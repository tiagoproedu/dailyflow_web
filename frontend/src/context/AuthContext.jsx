import { createContext, useState, useContext } from 'react';

// 1. Cria o Contexto
const AuthContext = createContext();

// Lê o utilizador guardado no login. Um valor corrompido no localStorage (edição
// manual, versão antiga do app) não pode derrubar o app inteiro no arranque.
const lerUtilizadorGuardado = () => {
  if (!localStorage.getItem('authToken')) return null;

  try {
    const guardado = localStorage.getItem('authUser');
    return guardado ? JSON.parse(guardado) : { name: 'Você' };
  } catch {
    return { name: 'Você' };
  }
};

// 2. Cria o Provedor (Provider)
// Este é o componente que vai "envolver" nossa aplicação.
// O estado é lido de forma síncrona: se o token já não valer, a primeira chamada à
// API devolve 401 e o apiClient nos expulsa.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(lerUtilizadorGuardado);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  // Função de Login que será usada pela LoginPage
  const login = (userData, authToken) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  // O valor que será disponibilizado para toda a aplicação
  const value = {
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Cria um hook customizado para facilitar o uso do contexto
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
