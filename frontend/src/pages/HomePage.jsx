// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';

// O que o app faz hoje, e só isso — ver "Nada de tela falsa" no CLAUDE.md.
const PONTOS = [
  { titulo: 'Hábitos com gatilho', texto: '“Quando eu terminar o café, então eu vou ler.”' },
  { titulo: 'Rotinas', texto: 'Monte uma vez; mande as tarefas para o dia com um toque.' },
  { titulo: 'Lembretes', texto: 'Um aviso na hora do gatilho — e silêncio se já fez.' },
];

function HomePage() {
  return (
    <main className="home-page">
      <div className="home-conteudo">
        <div className="auth-marca">
          <img src="/pwa-192.png" alt="" width="40" height="40" />
          <span>DailyFlow</span>
        </div>

        <h1 className="home-titulo">
          Hábitos que <span className="texto-gradiente">ficam</span>.
        </h1>
        <p className="home-subtitulo">
          Sua jornada para vencer a procrastinação e construir hábitos duradouros começa aqui.
        </p>

        <div className="home-acoes">
          <Link to="/register" className="btn btn-primary btn-grande">
            Criar conta
          </Link>
          <Link to="/login" className="btn btn-outline btn-grande">
            Já tenho conta
          </Link>
        </div>

        <ul className="home-pontos">
          {PONTOS.map((ponto) => (
            <li key={ponto.titulo}>
              <strong>{ponto.titulo}</strong>
              <span>{ponto.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default HomePage;
