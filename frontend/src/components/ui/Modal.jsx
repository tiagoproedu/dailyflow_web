import { useEffect, useId, useRef } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children }) {
  const contentRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  // `onClose` chega como uma função nova a cada render das páginas. Se ela entrasse
  // nas dependências do efeito abaixo, o modal roubaria o foco a cada tecla digitada.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const findFocusables = () => Array.from(
      contentRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) || []
    );

    // Guarda quem tinha o foco para devolver ao fechar, e leva o foco para o modal.
    // Focamos a caixa, não o primeiro campo: focar um input abriria o teclado do
    // celular de imediato, encolhendo a tela antes da pessoa decidir o que fazer.
    previouslyFocused.current = document.activeElement;
    contentRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      // Prende o Tab dentro do modal: sem isto o foco escapa para a página de trás,
      // que continua visível mas inerte.
      const items = findFocusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Trava a rolagem do fundo para o dedo não arrastar a página em vez do modal.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-button"
            aria-label="Fechar"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
