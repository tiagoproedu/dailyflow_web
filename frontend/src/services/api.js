// frontend/src/services/api.js

// Em produção o Caddy serve o app e faz proxy de /api para o backend, por isso o
// caminho relativo. Em desenvolvimento cai no backend local.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Quando a sessão morre, o app inteiro precisa saber — não adianta cada página
// tratar o 401 por conta própria. Limpamos o token e recomeçamos no login,
// avisando o motivo em vez de despejar a pessoa numa tela em branco.
const encerrarSessao = (mensagem) => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  sessionStorage.setItem('mensagemDeLogin', mensagem);
  window.location.assign('/login');
};

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
  // O fetch só rejeita em falha de rede. "Failed to fetch" não diz nada a quem está
  // usando o app, então traduzimos para algo acionável.
  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new Error('Não foi possível falar com o servidor. Verifique a sua ligação.');
  }

  if (response.status === 204) {
    return null;
  }

  // 5. Lida com a resposta
  const data = await response.json();

  // O 401 do /auth/login é "senha errada", e quem chamou é que deve mostrar isso.
  // Nas outras rotas, 401 significa que a sessão acabou.
  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    encerrarSessao(
      data.expirada
        ? 'A sua sessão expirou. Entre de novo.'
        : 'A sua sessão não é mais válida. Entre de novo.'
    );
    throw new Error(data.error || 'Sessão expirada.');
  }

  if (!response.ok) {
    // Se a API retornar um erro, nós o lançamos para ser capturado no componente
    throw new Error(data.error || 'Ocorreu um erro na API.');
  }

  return data; // Se tudo der certo, retorna os dados
};

export default apiClient;
