// frontend/src/App.jsx
import React from 'react';
import './styles/index.css';
import './styles/App.css';
import AppRoutes from './Routes';

function App() {
  // O App agora só precisa renderizar as rotas.
  return <AppRoutes />;
}

export default App;