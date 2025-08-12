// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// import './HomePage.css'; // Poderíamos criar um CSS específico depois

function HomePage() {
  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 className="header-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Bem-vindo ao DailyFlow
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--neutral-gray-dark)', marginBottom: '2.5rem' }}>
        Sua jornada para vencer a procrastinação e construir hábitos duradouros começa aqui.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
        <Link to="/register" className="btn btn-outline">
          Registrar
        </Link>
      </div>
    </div>
  );
}

export default HomePage;