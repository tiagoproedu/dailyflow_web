// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // Função para lidar com a digitação de campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Função para submeter o formulário de login
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no login.');
      }

      // Sucesso no login
      console.log('Login bem-sucedido:', data);
      login(data.user, data.token);

      navigate('/dashboard'); // Redireciona para a página do dashboard

    } catch (err) {
      setError(err.message);
      console.error('Erro no login:', err);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '450px', margin: 'auto', paddingTop: '2rem' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>Login</h1>
        
        {error && <p style={{ color: '#B91C1C', textAlign: 'center', background: '#FEE2E2', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>{error}</p>}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Entrar</button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--neutral-gray-dark)' }}>
          Não tem uma conta? <Link to="/register" style={{ color: 'var(--primary-blue-medium)' }}>Crie uma agora</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;