import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider)
// Este é o componente que vai "envolver" nossa aplicação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true); // Para sabermos se a autenticação inicial já foi checada

  // Efeito que roda quando o app carrega para "lembrar" do usuário
  useEffect(() => {
    if (token) {
      // Futuramente, aqui faremos uma chamada à API para validar o token e buscar dados do usuário.
      // Por agora, vamos simular que temos os dados do usuário.
      // Em um caso real: const userData = await api.get('/auth/me', token); setUser(userData);
      setUser({ name: "Usuário" }); // Simulação
    }
    setIsLoading(false);
  }, [token]);

  // Função de Login que será usada pela LoginPage
  const login = (userData, authToken) => {
    localStorage.setItem('authToken', authToken);
    setToken(authToken);
    setUser(userData);
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem('authToken');
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