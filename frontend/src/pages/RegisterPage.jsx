import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  // Função para atualizar o estado conforme o usuário digita
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({...prevState, [name]: value}));
  };

  // Função para lidar com o envio do formulário
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.error || 'Falha ao registrar');
      }

      // Se o registro for bem-sucedido, redireciona para a página de login
      navigate('/login');

    } catch (err) {
      setError(err.message);
      console.error('Erro no registro:', err);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '450px', margin: 'auto', paddingTop: '2rem' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center' }}>Criar Conta</h1>
        
        {/* Exibe a mensagem de erro, se houver */}
        {error && <p style={{ color: '#B91C1C', textAlign: 'center', background: '#FEE2E2', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>{error}</p>}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            />
          </div>
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
              minLength="6"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-gray-medium)' }}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Registrar</button>
          </div>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--neutral-gray-dark)' }}>
          Já tem uma conta? <Link to="/login" style={{ color: 'var(--primary-blue-medium)' }}>Faça o login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;