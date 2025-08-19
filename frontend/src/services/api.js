// frontend/src/services/api.js

const API_URL = 'http://localhost:3001/api';

// Esta será a nossa função central para fazer requisições
const apiClient = async (endpoint, method = 'GET', body = null) => {
  // 1. Pega o token salvo no localStorage
  const token = localStorage.getItem('authToken');

  // 2. Monta os cabeçalhos (headers) da requisição
  const headers = {
    'Content-Type': 'application/json',
  };

  // Se tivermos um token, adiciona ao cabeçalho de Autorização
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Monta as opções para a chamada fetch
  const config = {
    method: method,
    headers: headers,
  };

  // Se houver um corpo (para POST ou PATCH), adiciona ao config
  if (body) {
    config.body = JSON.stringify(body);
  }

  // 4. Executa a requisição fetch
  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  // 5. Lida com a resposta
  const data = await response.json();
  if (!response.ok) {
    // Se a API retornar um erro, nós o lançamos para ser capturado no componente
    throw new Error(data.error || 'Ocorreu um erro na API.');
  }

  return data; // Se tudo der certo, retorna os dados
};

export default apiClient;