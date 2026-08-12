import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider)
// Este é o componente que vai "envolver" nossa aplicação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true); // Para sabermos se a autenticação inicial já foi checada

  // Efeito que roda quando o app carrega para "lembrar" do usuário.
  // Guardamos os dados no login em vez de inventar um utilizador falso; se o token
  // já não valer, a primeira chamada à API devolve 401 e o apiClient nos expulsa.
  useEffect(() => {
    if (token) {
      const guardado = localStorage.getItem('authUser');
      setUser(guardado ? JSON.parse(guardado) : { name: 'Você' });
    }
    setIsLoading(false);
  }, [token]);

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
    isLoading,
    login,
    logout,
  };

  // Renderiza os componentes filhos dentro do Provedor
  // O `!isLoading &&` garante que a gente não mostre o app antes de checar o login
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// 3. Cria um hook customizado para facilitar o uso do contexto
export function useAuth() {
  return useContext(AuthContext);
}