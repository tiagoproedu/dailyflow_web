// src/components/companheiro/Companheiro.jsx
//
// A faixa do companheiro, no topo do dashboard.
//
// É deliberadamente **não interativa**, tirando o botão de dar um nome: não há
// alimentar, vestir nem loja. Uma criatura com que se brinca é um jogo dentro do app, e
// a regra 3 de `docs/engajamento.md` proíbe qualquer mecânica que aumente o tempo de
// sessão. Esta faixa mostra estado e sai da frente; quem age, age na vida.
//
// Compacta por obrigação: o topo do dashboard foi encurtado de propósito na revisão
// visual, e a lista de hábitos tem de continuar a caber na primeira tela.

import { useState } from 'react';
import Modal from '../ui/Modal';
import Criatura from './Criatura';
import {
  descreverCriatura,
  falaDoCompanheiro,
  nomeDoEstagio,
  resumoDoCompanheiro,
  sentidoDoEstagio,
  tempoJuntos,
} from '../../utils/companheiro';

function Companheiro({ companheiro, aoBatizar }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [aGravar, setAGravar] = useState(false);

  if (!companheiro) return null;

  const jaTemNome = Boolean(companheiro.nome);
  const resumo = resumoDoCompanheiro(companheiro);

  const abrir = () => {
    setNome(companheiro.nome || '');
    setErro('');
    setAberto(true);
  };

  const gravar = async (evento) => {
    evento.preventDefault();
    setErro('');
    setAGravar(true);

    try {
      await aoBatizar(nome);
      setAberto(false);
    } catch (problema) {
      // Erro de API vira texto na tela, nunca só um `console.error`.
      setErro(problema.message || 'Não foi possível dar o nome.');
    } finally {
      setAGravar(false);
    }
  };

  return (
    <>
      <section
        className={`companheiro${jaTemNome ? '' : ' companheiro-sem-nome'}`}
        aria-label="Seu companheiro"
      >
        <Criatura
          estagio={companheiro.estagio.chave}
          humor={companheiro.humor}
          temHabitos={companheiro.temHabitos}
        />

        <div className="companheiro-texto">
          {/* A descrição por palavras vive aqui porque o desenho é `aria-hidden`. */}
          <p className="companheiro-fala">
            <span className="sr-only">{descreverCriatura(companheiro)}. </span>
            {falaDoCompanheiro(companheiro)}
          </p>
          {resumo && <p className="companheiro-resumo">{resumo}</p>}
        </div>

        {/* Já batizado, o botão vira um lápis no canto: renomear é raro, e o texto
            comia metade da largura da frase numa tela de 360px. Sem nome ainda, ele é
            o contrário — a única coisa que a faixa pede. */}
        {jaTemNome ? (
          <button
            type="button"
            className="companheiro-renomear"
            onClick={abrir}
            aria-label={`Renomear ${companheiro.nome}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button type="button" className="btn btn-primary companheiro-batizar" onClick={abrir}>
            Dar um nome
          </button>
        )}
      </section>

      <Modal
        title={jaTemNome ? 'Renomear o companheiro' : 'Dar um nome'}
        isOpen={aberto}
        onClose={() => setAberto(false)}
      >
        <form onSubmit={gravar}>
          <div className="companheiro-retrato">
            <Criatura
              estagio={companheiro.estagio.chave}
              humor={companheiro.humor}
              temHabitos={companheiro.temHabitos}
              tamanho={96}
            />
            <p className="companheiro-estagio">
              <strong>{nomeDoEstagio(companheiro.estagio.chave)}</strong>
              <span className="texto-apoio"> — {sentidoDoEstagio(companheiro.estagio.chave)}</span>
            </p>
            {tempoJuntos(companheiro) && (
              <p className="texto-apoio">{tempoJuntos(companheiro)}</p>
            )}
          </div>

          {erro && <p className="form-error" role="alert">{erro}</p>}

          <div className="form-group">
            <label className="rotulo-campo" htmlFor="nome-do-companheiro">Nome</label>
            <input
              className="campo-texto"
              type="text"
              id="nome-do-companheiro"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={24}
              placeholder="Como você vai chamá-lo?"
              required
            />
          </div>

          <div className="form-actions" style={{ textAlign: 'right' }}>
            <button type="button" className="btn btn-outline" onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={aGravar}>
              {aGravar ? 'A gravar…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Companheiro;
