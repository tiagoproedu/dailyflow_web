import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import AuthLayout from '../components/auth/AuthLayout';

function RegisterPage() {

  // Hook para nos permitir redirecionar após o registro
  const navigate = useNavigate();

  // Estado para guardar os dados do formulário
  const [ formData, setFormData ] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Estado para lidar com messagem de erro
  const [ error, setError ] = useState(null);
  const [ enviando, setEnviando ] = useState(false);

  // Função para atualizar o estado conforme o usuário digita
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({...prevState, [name]: value}));
  };

  // Função para lidar com o envio do formulário
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setEnviando(true);

    try {
      await apiClient('/auth/register', 'POST', formData);

      // Antes o login abria sem dizer nada, e não ficava claro se a conta tinha sido criada.
      sessionStorage.setItem('mensagemDeLogin', 'Conta criada. Agora é só entrar.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Comece pequeno. O pequeno é o que gruda.">
      {error && <p role="alert" className="form-error">{error}</p>}

      <form onSubmit={handleFormSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name" className="rotulo-campo">Nome</label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="campo-texto"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="rotulo-campo">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="campo-texto"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="rotulo-campo">Senha</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            aria-describedby="senha-ajuda"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="campo-texto"
          />
          <p id="senha-ajuda" className="campo-ajuda">Pelo menos 6 caracteres.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-bloco" disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar conta'}
        </button>
      </form>

      <p className="auth-rodape">
        Já tem uma conta? <Link to="/login">Faça o login</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
