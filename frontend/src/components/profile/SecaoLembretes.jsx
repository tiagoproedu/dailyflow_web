import { useEffect, useState } from 'react';
import { lerEstado, ligar, desligar, testar } from '../../services/push';

/**
 * Liga e desliga os lembretes de hábito neste aparelho.
 *
 * A inscrição é por aparelho, não por conta: ligar no celular não liga no computador.
 * Por isso o estado é sempre lido do navegador, nunca assumido.
 */
function SecaoLembretes({ habitosComHorario }) {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    lerEstado().then(setEstado);
  }, []);

  const executar = async (acao, mensagemDeSucesso) => {
    setOcupado(true);
    setErro(null);
    setAviso(null);

    try {
      const resultado = await acao();

      if (resultado?.motivo === 'bloqueado') {
        setErro(
          'O navegador bloqueou as notificações deste site. Para reverter, abra as ' +
            'definições do site no navegador e permita notificações.'
        );
      } else if (resultado?.motivo === 'recusado') {
        setErro('Permissão não concedida. Nada foi ligado.');
      } else if (mensagemDeSucesso) {
        setAviso(mensagemDeSucesso);
      }
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setEstado(await lerEstado());
      setOcupado(false);
    }
  };

  if (!estado) {
    return (
      <div className="profile-section card">
        <div className="profile-section-header">
          <h2 className="section-title">Lembretes</h2>
        </div>
        <p role="status">A verificar…</p>
      </div>
    );
  }

  return (
    <div className="profile-section card">
      <div className="profile-section-header">
        <h2 className="section-title">Lembretes</h2>
      </div>

      {!estado.suportado && (
        <p className="form-aviso">
          Este navegador não recebe lembretes. No celular, abra o app pelo endereço
          <strong> https://</strong> e instale-o na tela inicial.
        </p>
      )}

      {estado.suportado && (
        <>
          <p className="lembretes-explicacao">
            O celular te avisa na hora do gatilho de cada hábito. Se você já marcou o
            hábito, o aviso daquele dia não chega.
          </p>

          {habitosComHorario === 0 && (
            <p className="form-aviso">
              Nenhum hábito seu tem horário definido, então não há o que lembrar. Edite um
              hábito e preencha a hora do gatilho.
            </p>
          )}

          <div className="profile-info-item">
            <strong>Neste aparelho:</strong>{' '}
            <span>{estado.inscrito ? 'Ligado' : 'Desligado'}</span>
          </div>

          <div className="profile-account-actions">
            {estado.inscrito ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={ocupado}
                  onClick={() => executar(desligar, 'Lembretes desligados neste aparelho.')}
                >
                  Desligar lembretes
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={ocupado}
                  onClick={() => executar(testar, 'Enviado. Deve chegar em segundos.')}
                >
                  Enviar um teste
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={ocupado || estado.permissao === 'denied'}
                onClick={() => executar(ligar, 'Pronto. Os lembretes chegam na hora de cada hábito.')}
              >
                Ligar lembretes neste aparelho
              </button>
            )}
          </div>

          {estado.permissao === 'denied' && !estado.inscrito && (
            <p className="form-aviso">
              As notificações estão bloqueadas nas definições do navegador para este site.
              É preciso liberá-las por lá antes de ligar aqui.
            </p>
          )}
        </>
      )}

      {aviso && (
        <p className="form-sucesso" role="status">
          {aviso}
        </p>
      )}
      {erro && (
        <p className="form-error" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export default SecaoLembretes;
