const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Verifica se o token está no cabeçalho de autorização
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ error: 'Não autorizado, sem token.' });
  }

  // Extrai o token do cabeçalho (formato: "Bearer TOKEN_LONGO")
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado, sem token.' });
  }

  try {
    // 2. Verifica se o token é válido usando a nossa chave secreta
    const decoded = jwt.verify(token, process.env.CHAVE_SECRETA);

    // 3. Anexa as informações do usuário decodificado ao objeto `req`
    // para que as próximas funções (controllers) saibam quem é o usuário
    req.user = decoded;

    return next(); // Se tudo estiver certo, permite que a requisição continue
  } catch (error) {
    // `expirada` distingue "a sua sessão acabou" de "este token é inválido".
    // O frontend usa isso para não assustar quem só ficou tempo demais fora.
    const expirada = error.name === 'TokenExpiredError';
    return res.status(401).json({
      error: expirada ? 'Sessão expirada.' : 'Não autorizado, token falhou.',
      expirada,
    });
  }
};

module.exports = { protect };
