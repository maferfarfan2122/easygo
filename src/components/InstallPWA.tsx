import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detectar si ya está instalada como PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Si ya está instalada, no mostrar el botón
    if (standalone) {
      setShowInstallButton(false);
      return;
    }

    // Para Android/Chrome - Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      console.log('PWA install prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS - Mostrar el botón si no está instalada
    if (iOS && !standalone) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Para iOS, mostrar instrucciones
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      // Para Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const closeIOSInstructions = () => {
    setShowIOSInstructions(false);
  };

  if (!showInstallButton || isStandalone) {
    return null;
  }

  return (
    <>
      {/* Install Button */}
      <button
        onClick={handleInstallClick}
        className="install-pwa-button"
        aria-label="Instalar aplicación"
      >
        <Download className="install-pwa-icon" />
        <div className="install-pwa-text">
          <span className="install-pwa-title">Instalar App</span>
          <span className="install-pwa-subtitle">
            {isIOS ? 'Safari iOS' : 'Acceso rápido'}
          </span>
        </div>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="install-pwa-modal-overlay" onClick={closeIOSInstructions}>
          <div className="install-pwa-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="install-pwa-modal-close"
              onClick={closeIOSInstructions}
              aria-label="Cerrar"
            >
              <X className="icon-small" />
            </button>

            <div className="install-pwa-modal-content">
              <div className="install-pwa-modal-icon">
                <Smartphone className="icon-large" />
              </div>

              <h2 className="install-pwa-modal-title">
                Instalar Easy Go en iOS
              </h2>

              <p className="install-pwa-modal-description">
                Para instalar Easy Go como aplicación en tu iPhone:
              </p>

              <ol className="install-pwa-steps">
                <li className="install-pwa-step">
                  <div className="install-pwa-step-number">1</div>
                  <div className="install-pwa-step-content">
                    <div className="install-pwa-step-icon">
                      <Share className="icon-small" />
                    </div>
                    <div className="install-pwa-step-text">
                      <strong>Toca el botón de compartir</strong>
                      <span>En la barra inferior de Safari</span>
                    </div>
                  </div>
                </li>

                <li className="install-pwa-step">
                  <div className="install-pwa-step-number">2</div>
                  <div className="install-pwa-step-content">
                    <div className="install-pwa-step-icon">
                      <Download className="icon-small" />
                    </div>
                    <div className="install-pwa-step-text">
                      <strong>Busca "Añadir a pantalla de inicio"</strong>
                      <span>Desplázate por las opciones</span>
                    </div>
                  </div>
                </li>

                <li className="install-pwa-step">
                  <div className="install-pwa-step-number">3</div>
                  <div className="install-pwa-step-content">
                    <div className="install-pwa-step-icon">
                      <Download className="icon-small" />
                    </div>
                    <div className="install-pwa-step-text">
                      <strong>Confirma la instalación</strong>
                      <span>Toca "Añadir" en la esquina superior</span>
                    </div>
                  </div>
                </li>
              </ol>

              <div className="install-pwa-modal-footer">
                <p>
                  ✨ La app aparecerá en tu pantalla de inicio como cualquier otra aplicación
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* === INSTALL PWA BUTTON === */
        .install-pwa-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-family: inherit;
        }

        .install-pwa-button:hover {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .install-pwa-button:active {
          transform: translateY(0);
        }

        .install-pwa-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .install-pwa-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .install-pwa-title {
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
        }

        .install-pwa-subtitle {
          font-size: 11px;
          opacity: 0.8;
          line-height: 1;
        }

        /* === MODAL OVERLAY === */
        .install-pwa-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* === MODAL === */
        .install-pwa-modal {
          background: #ffffff;
          border-radius: 24px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .install-pwa-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
          z-index: 1;
        }

        .install-pwa-modal-close:hover {
          background: #e5e7eb;
        }

        .install-pwa-modal-close .icon-small {
          width: 18px;
          height: 18px;
          color: #6b7280;
        }

        /* === MODAL CONTENT === */
        .install-pwa-modal-content {
          padding: 40px 32px 32px;
        }

        .ios-modal__icon {
          width: 64px;
          height: 64px;
          background: #111827;
          border-radius: 9999px;
          display: inline-grid;
          place-items: center;
          margin-bottom: 16px;
        }

        .ios-modal__icon svg {
          width: 32px;
          height: 32px;
          color: #ffffff;
        }        .install-pwa-modal-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          text-align: center;
          margin: 0 0 12px 0;
          letter-spacing: -0.025em;
        }

        .install-pwa-modal-description {
          font-size: 16px;
          color: #6b7280;
          text-align: center;
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        /* === STEPS === */
        .ios-modal__steps {
          margin-bottom: 32px;
        }

        .ios-modal__step {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .ios-modal__step:last-child {
          margin-bottom: 0;
        }

        .ios-modal__step-number {
          width: 32px;
          height: 32px;
          background: #111827;
          color: #ffffff;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .ios-modal__step-content {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: start;
        }

        .ios-modal__step-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 12px;
          display: grid;
          place-items: center;
        }

        .ios-modal__step-icon svg {
          width: 20px;
          height: 20px;
          color: #111827;
        }

        .ios-modal__step-text h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .ios-modal__step-text p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* === FOOTER === */
        .install-pwa-modal-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .install-pwa-modal-footer p {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin: 0;
          line-height: 1.5;
        }

        /* === ICONS === */
        .icon-small {
          width: 16px;
          height: 16px;
        }

        .icon-large {
          width: 40px;
          height: 40px;
        }

        /* === RESPONSIVE === */
        @media (max-width: 640px) {
          .install-pwa-modal {
            border-radius: 20px 20px 0 0;
            margin-top: auto;
            max-height: 85vh;
          }

          .install-pwa-modal-content {
            padding: 32px 24px 24px;
          }

          .install-pwa-modal-title {
            font-size: 20px;
          }

          .install-pwa-step {
            gap: 12px;
          }

          .install-pwa-step-number {
            width: 28px;
            height: 28px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

export default InstallPWA;
