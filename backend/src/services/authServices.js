// backend/src/services/authServices.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SENHA_MINIMA = 6;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Erro de dados enviados pelo utilizador: o controller devolve 400 com a mensagem.
class ErroDeValidacao extends Error {}

const normalizarEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

// Procura sem diferenciar maiúsculas: contas antigas foram gravadas tal como a
// pessoa digitou, e "Tiago@..." não pode ser outra conta além de "tiago@...".
const buscarPorEmail = (email) => prisma.user.findFirst({
  where: { email: { equals: email, mode: 'insensitive' } },
});

const registerUser = async (userData) => {
  const { name, password } = userData;
  const email = normalizarEmail(userData.email);

  // Antes um campo em falta chegava ao bcrypt/Prisma e virava um 500 genérico.
  if (typeof name !== 'string' || !name.trim()) {
    throw new ErroDeValidacao('Informe o seu nome.');
  }
  if (!EMAIL_VALIDO.test(email)) {
    throw new ErroDeValidacao('Informe um email válido.');
  }
  if (typeof password !== 'string' || password.length < SENHA_MINIMA) {
    throw new ErroDeValidacao(`A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`);
  }

  // 1. Verifica se o email já está em uso
  const existingUser = await buscarPorEmail(email);
  if (existingUser) {
    throw new Error('Este email já está em uso.');
  }

  // 2. Criptografa a senha antes de salvar (NUNCA salve senhas em texto puro)
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Cria o novo usuário no banco de dados
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email,
      passwordHash,
    },
  });

  // Remove a senha do objeto antes de retorná-lo
  delete newUser.passwordHash;
  return newUser;
};

const loginUser = async (loginData) => {
  const { password } = loginData;
  const email = normalizarEmail(loginData.email);

  // Sem isto o bcrypt recebia `undefined` e a tela mostrava "Illegal arguments".
  if (!email || typeof password !== 'string' || !password) {
    throw new Error('Credenciais inválidas');
  }

  // Encontra o usuário pelo email
  const user = await buscarPorEmail(email);
  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  // Compara a senha enviada com o hash armazenado
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas');
  }

  // Se a senha for válida, gera um token JWT.
  // 2h era curto demais para um app de hábitos: quem abre uma vez por dia
  // encontrava a sessão sempre vencida. Configurável pelo .env para o dia em que
  // o app deixar de ser só de uso pessoal.
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.CHAVE_SECRETA,
    { expiresIn: process.env.JWT_EXPIRACAO || '30d' }
  );

  // Remove a senha do objeto antes de retorná-lo
  delete user.passwordHash;

  // Retorna o token e as informações do usuário
  return { user, token };
}

module.exports = {
  registerUser,
  loginUser,
  ErroDeValidacao,
};
