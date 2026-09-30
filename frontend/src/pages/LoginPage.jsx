// frontend/src/pages/LoginPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import AuthLayout from '../components/auth/AuthLayout';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estado para os dados do formulário
  const [ formData, setFormData ] = useState({
    email: '',
    password: ''
  });

  // Estado para as mensagens de erro
  const [ error, setError ] = useState(null);
  // Evita o envio duplo enquanto a primeira tentativa ainda está a caminho.
  const [ enviando, setEnviando ] = useState(false);

  // Aviso deixado pelo apiClient quando ele encerra uma sessão vencida (ou pelo
  // registo, ao criar a conta). Sem isto, a pessoa chegava aqui sem entender por quê.
  const [ aviso, setAviso ] = useState(null);
  useEffect(() => {
    const mensagem = sessionStorage.getItem('mensagemDeLogin');
    if (mensagem) {
      setAviso(mensagem);
      sessionStorage.removeItem('mensagemDeLogin');
    }
  }, []);

  // Função para lidar com a digitação de campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Função para submeter o formulário de login
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setEnviando(true);

    try {
      const data = await apiClient('/auth/login', 'POST', formData);
      login(data.user, data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <AuthLayout titulo="Entrar" subtitulo="Bom te ver de novo.">
      {aviso && !error && (
        <p role="status" className="form-aviso">{aviso}</p>
      )}

      {error && <p role="alert" className="form-error">{error}</p>}

      <form onSubmit={handleFormSubmit} className="auth-form">
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
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="campo-texto"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-bloco" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth-rodape">
        Não tem uma conta? <Link to="/register">Crie uma agora</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
