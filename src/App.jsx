import React from "react";
import telefone from "/src/assets/telefone.png";
import logo from "/src/assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col lg:flex-row p-6 justify-around items-center bg-[#101728]">
      <div className="flex flex-col items-center w-full lg:w-auto">
        {/* Cabeçalho */}
        <header className="w-full flex justify-center lg:justify-start py-6 max-w-6xl">
          <img 
            src={logo} 
            alt="cabeça azul com cerebro branco" 
            className="w-14" 
            aria-hidden="true" 
          />
          <h1 className="text-4xl lg:text-6xl font-bold ml-4 mt-2">DailyFlow</h1>
        </header>

        {/* Seção principal */}
        <main className="flex flex-col items-center lg:items-start text-center lg:text-start justify-between mt-10 lg:mt-20 max-w-4xl min-h-96">
          <h2 className="text-4xl lg:text-6xl font-bold max-w-full lg:max-w-120">
            Seu assistente de hábitos, rotinas e produtividade
          </h2>
          <button 
          className="bg-gradient-to-r from-[#1f41bb] to-[#137dc5] rounded-full text-white text-center mt-6 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full min-w-40"
          onClick={() => window.location.href = "https://forms.gle/bw7EbBA4G7BBAVJX8"}
          aria-label="Pré-cadastrar no DailyFlow"
        >
          Pré-cadastrar
        </button>
        </main>
      </div>
      <div className="flex flex-col items-center justify-center mt-10 lg:mt-0">
        <div className="relative w-80 h-80 lg:w-110 lg:h-110">
          {/* Glow azul claro */}
          <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-50 rounded-lg"></div>
          <img
            src={telefone}
            alt="mulher mexendo no celular"
            className="relative w-full h-full object-cover rounded-lg"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;