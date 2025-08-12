// backend/src/services/auth.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // 1. Verifica se o email já está em uso
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Este email já está em uso.');
  }

  // 2. Criptografa a senha antes de salvar (NUNCA salve senhas em texto puro)
  const passwordHash = bcrypt.hashSync(password, 8); // O '8' é o "custo" do hash

  // 3. Cria o novo usuário no banco de dados
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash, // Salva a senha criptografada
    },
  });

  // Remove a senha do objeto antes de retorná-lo
  delete newUser.passwordHash;
  return newUser;
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Encontra o usuário pelo email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  // Compara a senha enviada com o hash armazenado
  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas');
  }

  // Se a senha for válida, gera um token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.CHAVE_SECRETA,
    { expiresIn: '2h' }
  );

  // Remove a senha do objeto antes de retorná-lo
  delete user.passwordHash;

  // Retorna o token e as informações do usuário
  return { user, token };
}

module.exports = {
  registerUser,
  loginUser
};