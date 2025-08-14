const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // 1. Verifica se o token está no cabeçalho de autorização
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token do cabeçalho (formato: "Bearer TOKEN_LONGO")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica se o token é válido usando a nossa chave secreta
      const decoded = jwt.verify(token, process.env.CHAVE_SECRETA);

      // 3. Anexa as informações do usuário decodificado ao objeto `req`
      // para que as próximas funções (controllers) saibam quem é o usuário
      req.user = decoded;

      next(); // Se tudo estiver certo, permite que a requisição continue
    } catch (error) {
      res.status(401).json({ error: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Não autorizado, sem token.' });
  }
};

module.exports = { protect };