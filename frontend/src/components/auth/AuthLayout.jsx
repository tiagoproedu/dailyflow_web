import { Link } from 'react-router-dom';

// Moldura comum do login e do registo: a marca em cima e o cartão do formulário.
function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <main className="auth-page">
      <div className="auth-conteudo">
        <Link to="/" className="auth-marca">
          <img src="/pwa-192.png" alt="" width="40" height="40" />
          <span>DailyFlow</span>
        </Link>

        <div className="auth-card">
          <h1 className="auth-titulo">{titulo}</h1>
          {subtitulo && <p className="auth-subtitulo">{subtitulo}</p>}
          {children}
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
