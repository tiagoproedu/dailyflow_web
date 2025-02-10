import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-row p-6 justify-around">
      <div className="flex flex-col items-center">
        {/* Cabeçalho */}
        <header className="w-full flex items-center justify-start py-6 max-w-6xl">
          <img src="./src/assets/logo.png" alt="cabeça azul com cerebro branco" className="w-14" />
          <h1 className="text-6xl font-bold ml-4 mt-2">DailyFlow</h1>
        </header>

        {/* Seção principal */}
        <main className="flex flex-col items-start text-start justify-between mt-20 max-w-4xl min-h-96">
          <h2 className="text-6xl font-bold max-w-120">Seu assistente de hábitos, rotinas e produtividade</h2>
          <button className="bg-linear-to-r from-[#1f41bb] to-[#137dc5] rounded-full">Pré-cadastrar</button>
        </main>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-110 h-110">
          {/* Glow azul claro */}
          <div className="absolute inset-0 bg-blue-300 blur-2xl opacity-50 rounded-lg"></div>
          <img
            src="./src/assets/telefone.png"
            alt="mulher mexendo no celular"
            className="relative w-110 h-110 object-cover rounded-lg " />
        </div>
      </div>
    </div>
  );
};

export default Home;
