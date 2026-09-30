import telefone from "./assets/telefone.png";
import logo from "./assets/logo.png";

const LINK_PRE_CADASTRO = "https://forms.gle/bw7EbBA4G7BBAVJX8";

const RECURSOS = [
  {
    titulo: "Hábitos com gatilho",
    texto: "“Quando eu terminar o café, então eu vou ler.” Ligar o hábito a um momento do dia é o que faz ele pegar.",
  },
  {
    titulo: "Rotinas prontas",
    texto: "Monte a sua rotina da manhã uma vez e mande as tarefas para o dia com um toque.",
  },
  {
    titulo: "Lembrete na hora certa",
    texto: "O celular avisa na hora do gatilho — e fica quieto se você já fez.",
  },
];

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1120] text-slate-100">
      {/* Brilhos de fundo: só decoração. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-32 h-[26rem] w-[26rem] rounded-full bg-violet-600/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center gap-3 py-6">
          <img src={logo} alt="" className="h-10 w-auto" />
          <span className="font-display text-2xl tracking-tight">DailyFlow</span>
        </header>

        <main className="flex flex-1 flex-col items-center gap-12 py-10 lg:flex-row lg:gap-16 lg:py-16">
          <section className="flex-1 text-center lg:text-left">
            <p className="mb-4 inline-block rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-sm text-blue-200">
              Em breve no seu celular
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Seu assistente de hábitos, rotinas e{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                produtividade
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300 lg:mx-0">
              Menos força de vontade, mais constância. O DailyFlow ajuda você a
              começar pequeno e a voltar no dia seguinte.
            </p>
            <a
              href={LINK_PRE_CADASTRO}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#1f41bb] to-[#137dc5] px-8 text-lg font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              Quero me pré-cadastrar
            </a>
          </section>

          <div className="relative w-full max-w-md flex-1 lg:max-w-lg">
            <div aria-hidden="true" className="absolute inset-4 rounded-3xl bg-blue-400/40 blur-2xl" />
            <img
              src={telefone}
              alt="Mulher usando o celular"
              className="relative aspect-[14/9] w-full rounded-3xl object-cover ring-1 ring-white/10"
            />
          </div>
        </main>

        <section aria-label="O que o DailyFlow faz" className="grid gap-4 pb-12 sm:grid-cols-3">
          {RECURSOS.map((recurso) => (
            <article
              key={recurso.titulo}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <h2 className="font-display text-lg text-white">{recurso.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{recurso.texto}</p>
            </article>
          ))}
        </section>

        <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} DailyFlow
        </footer>
      </div>
    </div>
  );
};

export default Home;
