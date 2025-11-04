import { useState } from 'react';
import { Upload, FileText, Download, TrendingUp, AlertCircle, CheckCircle, Zap, Sparkles, Gauge, X } from 'lucide-react';

type ModeType = 'analyze' | 'optimize';
type OptimizationModeType = 'light' | 'medium' | 'aggressive';

interface AnalysisData {
  analysis?: {
    file_size_mb: number;
    num_pages: number;
    num_images: number;
    optimization_potential: string;
  };
  recommendations?: Record<string, string>;
  success?: boolean;
  optimizationStats?: {
    processingTime: string;
    originalSizeMB: number;
    optimizedSizeMB: number;
    reductionPercent: number;
    imagesCompressed: number;
    pages: number;
    mode: string;
  };
}

const PDFOptimizer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [optimizedPdfUrl, setOptimizedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ModeType>('optimize');
  const [optimizationMode, setOptimizationMode] = useState<OptimizationModeType>('medium');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
      setOptimizedPdfUrl(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setAnalysis(null);
      setOptimizedPdfUrl(null);
    } else {
      setError('⚠️ Por favor arrastra un archivo PDF válido');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
    setOptimizedPdfUrl(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('⚠️ Por favor selecciona un PDF primero');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_URL}/api/tools/pdf-analyzer`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo analizar el PDF`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al analizar el PDF. Intenta de nuevo.';
      setError(`❌ ${errorMessage}`);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      setError('⚠️ Por favor selecciona un PDF primero');
      return;
    }

    setLoading(true);
    setError(null);
    setOptimizedPdfUrl(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 85));
      }, 300);

      const response = await fetch(`${API_URL}/api/tools/pdf-optimizer?mode=${optimizationMode}`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(95);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo optimizar el PDF'}`);
      }

      // Obtener headers con estadísticas
      const processingTime = response.headers.get('X-Processing-Time');
      const originalSizeMB = response.headers.get('X-Original-Size-MB');
      const optimizedSizeMB = response.headers.get('X-Optimized-Size-MB');
      const reductionPercent = response.headers.get('X-Reduction-Percent');
      const imagesCompressed = response.headers.get('X-Images-Compressed');
      const pages = response.headers.get('X-Pages');

      // Crear URL del PDF optimizado
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setOptimizedPdfUrl(url);
      setProgress(100);

      // Mostrar estadísticas de optimización
      setAnalysis({
        success: true,
        optimizationStats: {
          processingTime: processingTime || '',
          originalSizeMB: parseFloat(originalSizeMB || '0') || 0,
          optimizedSizeMB: parseFloat(optimizedSizeMB || '0') || 0,
          reductionPercent: parseFloat(reductionPercent || '0') || 0,
          imagesCompressed: parseInt(imagesCompressed || '0') || 0,
          pages: parseInt(pages || '0') || 0,
          mode: optimizationMode
        }
      });

      // Auto-descargar el PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized_${optimizationMode}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al optimizar el PDF. Intenta de nuevo.';
      setError(`❌ ${errorMessage}`);
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getModeIcon = (modeName: OptimizationModeType): React.ReactNode => {
    switch(modeName) {
      case 'light': return <Gauge className="w-5 h-5" />;
      case 'medium': return <Zap className="w-5 h-5" />;
      case 'aggressive': return <Sparkles className="w-5 h-5" />;
      default: return null;
    }
  };

  const getModeDescription = (modeName: OptimizationModeType): string => {
    switch(modeName) {
      case 'light': return '120 DPI • 50-60% reducción • Buena calidad';
      case 'medium': return '96 DPI • 65-75% reducción • Balanceado';
      case 'aggressive': return '72 DPI • 75-85% reducción • Máxima compresión';
      default: return '';
    }
  };

  return (
    <div className="pdf-optimizer">
      <div className="pdf-optimizer__container">
        {/* Header estilo Apple */}
        <div className="pdf-optimizer__header">
          <h1 className="pdf-optimizer__title">
            Optimizador de PDF
          </h1>
          <p className="pdf-optimizer__subtitle">
            Reduce el tamaño de tus archivos hasta un <span className="pdf-optimizer__highlight">85%</span>
          </p>
          <div className="pdf-optimizer__badges">
            <span className="pdf-optimizer__badge">
              <Zap className="pdf-optimizer__badge-icon" /> 
              Instantáneo
            </span>
            <span className="pdf-optimizer__badge">
              <CheckCircle className="pdf-optimizer__badge-icon" /> 
              Gratis
            </span>
            <span className="pdf-optimizer__badge">
              <Sparkles className="pdf-optimizer__badge-icon" /> 
              Sin IA
            </span>
          </div>
        </div>

        {/* Upload Area estilo Apple */}
        <div
          className={`pdf-optimizer__upload ${
            dragActive 
              ? 'pdf-optimizer__upload--drag-active' 
              : file 
              ? 'pdf-optimizer__upload--file-loaded'
              : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && document.getElementById('file-input')?.click()}
        >
          <div className="pdf-optimizer__upload-content">
            {file ? (
              <div className="pdf-optimizer__file-info">
                <div className="pdf-optimizer__file-icon pdf-optimizer__file-icon--success">
                  <FileText className="icon-large" />
                </div>
                <p className="pdf-optimizer__file-name">{file.name}</p>
                <p className="pdf-optimizer__file-size">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="pdf-optimizer__remove-btn"
                >
                  <X className="icon-small" />
                  Eliminar
                </button>
              </div>
            ) : (
              <div className="pdf-optimizer__upload-prompt">
                <div className={`pdf-optimizer__upload-icon ${
                  dragActive ? 'pdf-optimizer__upload-icon--active' : ''
                }`}>
                  <Upload className="icon-large" />
                </div>
                <p className="pdf-optimizer__upload-title">
                  {dragActive ? 'Suelta tu archivo' : 'Arrastra un PDF'}
                </p>
                <p className="pdf-optimizer__upload-subtitle">
                  o haz clic para seleccionar
                </p>
                <p className="pdf-optimizer__upload-hint">
                  Soporta cualquier tipo de PDF
                </p>
              </div>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="pdf-optimizer__file-input"
          />
        </div>

        {/* Mode Toggle estilo Apple */}
        <div className="pdf-optimizer__mode-toggle">
          <button
            onClick={() => setMode('analyze')}
            className={`pdf-optimizer__mode-btn ${
              mode === 'analyze' ? 'pdf-optimizer__mode-btn--active' : ''
            }`}
          >
            <TrendingUp className="icon-medium" />
            Analizar
          </button>
          <button
            onClick={() => setMode('optimize')}
            className={`pdf-optimizer__mode-btn ${
              mode === 'optimize' ? 'pdf-optimizer__mode-btn--active' : ''
            }`}
          >
            <Sparkles className="icon-medium" />
            Optimizar
          </button>
        </div>

        {/* Optimization Mode Selector estilo Apple */}
        {mode === 'optimize' && (
          <div className="pdf-optimizer__card pdf-optimizer__optimization-selector">
            <h3 className="pdf-optimizer__card-title">
              Elige el nivel de compresión
            </h3>
            <div className="pdf-optimizer__mode-grid">
              {(['light', 'medium', 'aggressive'] as const).map((modeName) => {
                const isSelected = optimizationMode === modeName;
                
                return (
                  <button
                    key={modeName}
                    onClick={() => setOptimizationMode(modeName)}
                    className={`pdf-optimizer__mode-card ${
                      isSelected ? 'pdf-optimizer__mode-card--selected' : ''
                    }`}
                  >
                    {isSelected && (
                      <div className="pdf-optimizer__mode-check">
                        <CheckCircle className="icon-small-white" />
                      </div>
                    )}
                    <div className="pdf-optimizer__mode-content">
                      <div className="pdf-optimizer__mode-icon-wrapper">
                        {getModeIcon(modeName)}
                      </div>
                      <div className="pdf-optimizer__mode-name">
                        {modeName === 'light' ? 'Ligero' : modeName === 'medium' ? 'Medio' : 'Agresivo'}
                      </div>
                      <div className="pdf-optimizer__mode-description">
                        {getModeDescription(modeName)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Bar estilo Apple */}
        {loading && (
          <div className="pdf-optimizer__progress">
            <div className="pdf-optimizer__card">
              <div className="pdf-optimizer__progress-header">
                <span className="pdf-optimizer__progress-label">
                  {mode === 'analyze' ? 'Analizando' : 'Optimizando'}
                </span>
                <span className="pdf-optimizer__progress-percent">{progress}%</span>
              </div>
              <div className="pdf-optimizer__progress-bar">
                <div 
                  className="pdf-optimizer__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="pdf-optimizer__progress-status">
                {progress < 30 ? 'Iniciando...' : 
                 progress < 70 ? 'Procesando...' : 
                 progress < 95 ? 'Casi listo...' : 
                 'Finalizando'}
              </p>
            </div>
          </div>
        )}

        {/* Action Button estilo Apple */}
        <button
          onClick={mode === 'analyze' ? handleAnalyze : handleOptimize}
          disabled={!file || loading}
          className={`pdf-optimizer__action-btn ${
            !file || loading ? 'pdf-optimizer__action-btn--disabled' : ''
          }`}
        >
          {loading ? (
            <span className="pdf-optimizer__btn-content">
              <svg className="pdf-optimizer__spinner" viewBox="0 0 24 24">
                <circle className="pdf-optimizer__spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="pdf-optimizer__spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando
            </span>
          ) : mode === 'analyze' ? (
            <span className="pdf-optimizer__btn-content">
              <TrendingUp className="icon-medium" />
              Analizar PDF
            </span>
          ) : (
            <span className="pdf-optimizer__btn-content">
              <Sparkles className="icon-medium" />
              Optimizar y Descargar
            </span>
          )}
        </button>

        {/* Error Message estilo Apple */}
        {error && (
          <div className="pdf-optimizer__error">
            <div className="pdf-optimizer__error-icon">
              <AlertCircle className="icon-medium" />
            </div>
            <div className="pdf-optimizer__error-content">
              <h3 className="pdf-optimizer__error-title">Algo salió mal</h3>
              <p className="pdf-optimizer__error-message">{error}</p>
              <div className="pdf-optimizer__error-suggestions">
                <p className="pdf-optimizer__error-suggestions-title">Intenta lo siguiente:</p>
                <ul className="pdf-optimizer__error-list">
                  <li>Verifica que sea un PDF válido</li>
                  <li>Prueba con un modo más ligero</li>
                  <li>Asegúrate que el archivo no esté dañado</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="pdf-optimizer__error-close"
            >
              <X className="icon-medium" />
            </button>
          </div>
        )}

        {/* Analysis Results estilo Apple */}
        {analysis && mode === 'analyze' && analysis.analysis && (
          <div className="pdf-optimizer__card pdf-optimizer__results">
            <h3 className="pdf-optimizer__card-title">
              Análisis del PDF
            </h3>
            
            <div className="pdf-optimizer__stats-grid">
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Tamaño</div>
                <div className="pdf-optimizer__stat-value">
                  {analysis.analysis.file_size_mb}
                </div>
                <div className="pdf-optimizer__stat-unit">MB</div>
              </div>
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Páginas</div>
                <div className="pdf-optimizer__stat-value">
                  {analysis.analysis.num_pages}
                </div>
              </div>
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Imágenes</div>
                <div className="pdf-optimizer__stat-value">
                  {analysis.analysis.num_images}
                </div>
              </div>
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Potencial</div>
                <div className="pdf-optimizer__stat-value pdf-optimizer__stat-value--capitalize">
                  {analysis.analysis.optimization_potential === 'high' ? 'Alto' : 
                   analysis.analysis.optimization_potential === 'medium' ? 'Medio' : 'Bajo'}
                </div>
              </div>
            </div>

            {analysis.recommendations && (
              <div className="pdf-optimizer__recommendations">
                <h4 className="pdf-optimizer__recommendations-title">
                  Reducción estimada por modo
                </h4>
                <div className="pdf-optimizer__recommendations-list">
                  {Object.entries(analysis.recommendations).map(([mode, rec]) => (
                    <div key={mode} className="pdf-optimizer__recommendation-item">
                      <span className="pdf-optimizer__recommendation-mode">
                        {mode === 'light' ? 'Ligero' : mode === 'medium' ? 'Medio' : 'Agresivo'}
                      </span>
                      <span className="pdf-optimizer__recommendation-value">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimization Results estilo Apple */}
        {analysis && mode === 'optimize' && analysis.optimizationStats && (
          <div className="pdf-optimizer__card pdf-optimizer__results pdf-optimizer__results--success">
            <div className="pdf-optimizer__success-header">
              <div className="pdf-optimizer__success-icon">
                <CheckCircle className="icon-large" />
              </div>
              <h3 className="pdf-optimizer__card-title">
                Optimización completa
              </h3>
              <p className="pdf-optimizer__success-subtitle">Tu PDF ha sido reducido exitosamente</p>
            </div>
            
            <div className="pdf-optimizer__stats-grid">
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Original</div>
                <div className="pdf-optimizer__stat-value">
                  {analysis.optimizationStats.originalSizeMB}
                </div>
                <div className="pdf-optimizer__stat-unit">MB</div>
              </div>
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Optimizado</div>
                <div className="pdf-optimizer__stat-value pdf-optimizer__stat-value--success">
                  {analysis.optimizationStats.optimizedSizeMB}
                </div>
                <div className="pdf-optimizer__stat-unit">MB</div>
              </div>
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Reducción</div>
                <div className="pdf-optimizer__stat-value">
                  {analysis.optimizationStats.reductionPercent}
                </div>
                <div className="pdf-optimizer__stat-unit">%</div>
              </div>
              <div className="pdf-optimizer__stat">
                <div className="pdf-optimizer__stat-label">Páginas</div>
                <div className="pdf-optimizer__stat-value">
                  {analysis.optimizationStats.pages}
                </div>
              </div>
            </div>

            {optimizedPdfUrl && file && (
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = optimizedPdfUrl;
                  link.download = `optimized_${optimizationMode}_${file.name}`;
                  link.click();
                }}
                className="pdf-optimizer__download-btn"
              >
                <Download className="icon-medium" />
                Descargar PDF Optimizado
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        /* === VARIABLES === */
        :root {
          --color-black: #111827;
          --color-gray-900: #1f2937;
          --color-gray-600: #4b5563;
          --color-gray-500: #6b7280;
          --color-gray-200: #e5e7eb;
          --color-gray-100: #f3f4f6;
          --color-gray-50: #f9fafb;
          --color-white: #ffffff;
          --color-blue-500: #3b82f6;
          --color-blue-50: #eff6ff;
          --color-green-600: #16a34a;
          --color-green-100: #dcfce7;
          --color-green-50: #f0fdf4;
          --color-red-900: #7f1d1d;
          --color-red-700: #b91c1c;
          --color-red-600: #dc2626;
          --color-red-200: #fecaca;
          --color-red-100: #fee2e2;
          --color-red-50: #fef2f2;
          
          --border-radius-xl: 24px;
          --border-radius-lg: 16px;
          --border-radius-md: 12px;
          --border-radius-full: 9999px;
          
          --spacing-1: 4px;
          --spacing-2: 8px;
          --spacing-3: 12px;
          --spacing-4: 16px;
          --spacing-5: 20px;
          --spacing-6: 24px;
          --spacing-8: 32px;
          --spacing-10: 40px;
          --spacing-12: 48px;
          --spacing-16: 64px;
          --spacing-20: 80px;
          
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        /* === RESET & BASE === */
        * {
          box-sizing: border-box;
        }

        /* === LAYOUT === */
        .pdf-optimizer {
          min-height: 100vh;
          background: linear-gradient(to bottom, var(--color-gray-50), var(--color-white));
          padding: var(--spacing-20) var(--spacing-4);
        }

        .pdf-optimizer__container {
          max-width: 896px;
          margin: 0 auto;
        }

        /* === HEADER === */
        .pdf-optimizer__header {
          text-align: center;
          margin-bottom: var(--spacing-16);
          animation: fadeIn 0.5s ease-out;
        }

        .pdf-optimizer__title {
          font-size: 72px;
          font-weight: 600;
          color: var(--color-black);
          margin: 0 0 var(--spacing-6) 0;
          letter-spacing: -0.025em;
          line-height: 1;
        }

        .pdf-optimizer__subtitle {
          font-size: 24px;
          color: var(--color-gray-600);
          font-weight: 300;
          margin: 0 0 var(--spacing-8) 0;
        }

        .pdf-optimizer__highlight {
          font-weight: 600;
          color: var(--color-black);
        }

        .pdf-optimizer__badges {
          display: inline-block;
        }

        .pdf-optimizer__badge {
          display: inline-block;
          margin: 0 var(--spacing-4);
          font-size: 14px;
          color: var(--color-gray-500);
          font-weight: 500;
        }

        .pdf-optimizer__badge-icon {
          width: 16px;
          height: 16px;
          vertical-align: middle;
          margin-right: var(--spacing-1);
          margin-top: -2px;
        }

        /* === UPLOAD AREA === */
        .pdf-optimizer__upload {
          position: relative;
          background: var(--color-white);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--border-radius-xl);
          margin-bottom: var(--spacing-12);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .pdf-optimizer__upload:hover {
          border-color: var(--color-gray-500);
          box-shadow: var(--shadow-lg);
        }

        .pdf-optimizer__upload--drag-active {
          background: var(--color-blue-50);
          border-color: var(--color-blue-500);
          transform: scale(1.02);
        }

        .pdf-optimizer__upload--file-loaded {
          background: var(--color-white);
          border-color: var(--color-green-600);
          box-shadow: var(--shadow-xl);
        }

        .pdf-optimizer__upload-content {
          padding: var(--spacing-16);
        }

        .pdf-optimizer__file-info {
          animation: slideUp 0.5s ease-out;
          text-align: center;
        }

        .pdf-optimizer__file-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--border-radius-full);
          display: inline-block;
          margin-bottom: var(--spacing-6);
          position: relative;
        }

        .pdf-optimizer__file-icon--success {
          background: var(--color-green-100);
        }

        .pdf-optimizer__file-icon .icon-large {
          width: 40px;
          height: 40px;
          color: var(--color-green-600);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pdf-optimizer__file-name {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-black);
          margin: 0 0 var(--spacing-2) 0;
        }

        .pdf-optimizer__file-size {
          font-size: 16px;
          color: var(--color-gray-500);
          margin: 0 0 var(--spacing-8) 0;
        }

        .pdf-optimizer__remove-btn {
          display: inline-block;
          padding: var(--spacing-2) var(--spacing-6);
          background: var(--color-gray-100);
          color: var(--color-gray-900);
          border: none;
          border-radius: var(--border-radius-full);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .pdf-optimizer__remove-btn:hover {
          background: var(--color-gray-200);
        }

        .pdf-optimizer__remove-btn .icon-small {
          width: 16px;
          height: 16px;
          vertical-align: middle;
          margin-right: var(--spacing-1);
          margin-top: -2px;
        }

        .pdf-optimizer__upload-prompt {
          animation: fadeIn 0.5s ease-out;
          text-align: center;
        }

        .pdf-optimizer__upload-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--border-radius-full);
          background: var(--color-gray-100);
          display: inline-block;
          margin-bottom: var(--spacing-6);
          transition: all 0.3s ease;
          position: relative;
        }

        .pdf-optimizer__upload-icon--active {
          background: var(--color-blue-50);
        }

        .pdf-optimizer__upload-icon .icon-large {
          width: 40px;
          height: 40px;
          color: var(--color-gray-500);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: color 0.3s ease;
        }

        .pdf-optimizer__upload-icon--active .icon-large {
          color: var(--color-blue-500);
        }

        .pdf-optimizer__upload-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-black);
          margin: 0 0 var(--spacing-2) 0;
        }

        .pdf-optimizer__upload-subtitle {
          font-size: 16px;
          color: var(--color-gray-500);
          margin: 0 0 var(--spacing-4) 0;
        }

        .pdf-optimizer__upload-hint {
          font-size: 14px;
          color: var(--color-gray-500);
          margin: 0;
        }

        .pdf-optimizer__file-input {
          display: none;
        }

        /* === MODE TOGGLE === */
        .pdf-optimizer__mode-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-4);
          background: var(--color-gray-100);
          padding: var(--spacing-2);
          border-radius: var(--border-radius-lg);
          margin-bottom: var(--spacing-12);
        }

        .pdf-optimizer__mode-btn {
          padding: var(--spacing-3) var(--spacing-6);
          background: transparent;
          border: none;
          border-radius: var(--border-radius-md);
          font-weight: 500;
          font-size: 16px;
          color: var(--color-gray-600);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .pdf-optimizer__mode-btn:hover {
          color: var(--color-black);
        }

        .pdf-optimizer__mode-btn--active {
          background: var(--color-white);
          color: var(--color-black);
          box-shadow: var(--shadow-md);
        }

        .pdf-optimizer__mode-btn .icon-medium {
          width: 20px;
          height: 20px;
          vertical-align: middle;
          margin-right: var(--spacing-2);
          margin-top: -2px;
        }

        /* === CARD === */
        .pdf-optimizer__card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-xl);
          padding: var(--spacing-10);
          margin-bottom: var(--spacing-12);
          box-shadow: var(--shadow-sm);
        }

        .pdf-optimizer__card-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-black);
          margin: 0 0 var(--spacing-8) 0;
          text-align: center;
        }

        /* === OPTIMIZATION SELECTOR === */
        .pdf-optimizer__optimization-selector {
          animation: slideDown 0.5s ease-out;
        }

        .pdf-optimizer__mode-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-4);
        }

        .pdf-optimizer__mode-card {
          position: relative;
          padding: var(--spacing-8);
          background: var(--color-white);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pdf-optimizer__mode-card:hover {
          border-color: var(--color-gray-500);
          background: var(--color-gray-50);
        }

        .pdf-optimizer__mode-card--selected {
          border-color: var(--color-black);
          background: var(--color-gray-50);
          box-shadow: var(--shadow-md);
        }

        .pdf-optimizer__mode-check {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: var(--color-black);
          border-radius: var(--border-radius-full);
          display: block;
        }

        .pdf-optimizer__mode-check .icon-small-white {
          width: 16px;
          height: 16px;
          color: var(--color-white);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pdf-optimizer__mode-content {
          text-align: center;
        }

        .pdf-optimizer__mode-icon-wrapper {
          width: 48px;
          height: 48px;
          background: var(--color-gray-100);
          border-radius: var(--border-radius-full);
          display: inline-block;
          margin-bottom: var(--spacing-4);
          position: relative;
        }

        .pdf-optimizer__mode-icon-wrapper svg {
          width: 20px;
          height: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pdf-optimizer__mode-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-black);
          margin: 0 0 var(--spacing-2) 0;
        }

        .pdf-optimizer__mode-description {
          font-size: 14px;
          color: var(--color-gray-500);
          line-height: 1.5;
          margin: 0;
        }

        /* === PROGRESS BAR === */
        .pdf-optimizer__progress {
          margin-bottom: var(--spacing-12);
          animation: fadeIn 0.5s ease-out;
        }

        .pdf-optimizer__progress-header {
          display: block;
          margin-bottom: var(--spacing-4);
        }

        .pdf-optimizer__progress-label {
          font-size: 16px;
          font-weight: 500;
          color: var(--color-black);
          display: inline-block;
        }

        .pdf-optimizer__progress-percent {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-black);
          float: right;
        }

        .pdf-optimizer__progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-gray-100);
          border-radius: var(--border-radius-full);
          overflow: hidden;
          margin-bottom: var(--spacing-4);
        }

        .pdf-optimizer__progress-fill {
          height: 100%;
          background: var(--color-black);
          border-radius: var(--border-radius-full);
          transition: width 0.3s ease-out;
        }

        .pdf-optimizer__progress-status {
          font-size: 14px;
          color: var(--color-gray-500);
          font-weight: 300;
          text-align: center;
          margin: var(--spacing-4) 0 0 0;
        }

        /* === ACTION BUTTON === */
        .pdf-optimizer__action-btn {
          width: 100%;
          padding: var(--spacing-4) var(--spacing-8);
          background: var(--color-black);
          color: var(--color-white);
          border: none;
          border-radius: var(--border-radius-full);
          font-weight: 500;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-md);
          margin-bottom: var(--spacing-12);
        }

        .pdf-optimizer__action-btn:hover {
          background: var(--color-gray-900);
          box-shadow: var(--shadow-lg);
        }

        .pdf-optimizer__action-btn:active {
          transform: scale(0.98);
        }

        .pdf-optimizer__action-btn--disabled {
          background: var(--color-gray-200);
          color: var(--color-gray-500);
          cursor: not-allowed;
          box-shadow: none;
        }

        .pdf-optimizer__action-btn--disabled:hover {
          background: var(--color-gray-200);
          box-shadow: none;
          transform: none;
        }

        .pdf-optimizer__btn-content {
          display: block;
          text-align: center;
        }

        .pdf-optimizer__btn-content .icon-medium {
          width: 20px;
          height: 20px;
          vertical-align: middle;
          margin-right: var(--spacing-2);
          margin-top: -2px;
        }

        .pdf-optimizer__spinner {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: var(--spacing-3);
          margin-top: -2px;
        }

        .pdf-optimizer__spinner-circle {
          opacity: 0.25;
        }

        .pdf-optimizer__spinner-path {
          opacity: 0.75;
        }

        /* === ERROR MESSAGE === */
        .pdf-optimizer__error {
          background: var(--color-red-50);
          border: 1px solid var(--color-red-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-6);
          margin-bottom: var(--spacing-12);
          animation: fadeIn 0.5s ease-out;
          position: relative;
        }

        .pdf-optimizer__error-icon {
          width: 40px;
          height: 40px;
          background: var(--color-red-100);
          border-radius: var(--border-radius-full);
          display: inline-block;
          vertical-align: top;
          margin-right: var(--spacing-4);
          position: relative;
        }

        .pdf-optimizer__error-icon .icon-medium {
          width: 20px;
          height: 20px;
          color: var(--color-red-600);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pdf-optimizer__error-content {
          display: inline-block;
          vertical-align: top;
          width: calc(100% - 120px);
        }

        .pdf-optimizer__error-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-red-900);
          margin: 0 0 var(--spacing-1) 0;
        }

        .pdf-optimizer__error-message {
          font-size: 14px;
          color: var(--color-red-700);
          font-weight: 300;
          margin: 0 0 var(--spacing-3) 0;
        }

        .pdf-optimizer__error-suggestions {
          background: rgba(255, 255, 255, 0.5);
          padding: var(--spacing-3);
          border-radius: var(--border-radius-md);
        }

        .pdf-optimizer__error-suggestions-title {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-red-700);
          margin: 0 0 var(--spacing-1) 0;
        }

        .pdf-optimizer__error-list {
          margin: 0;
          padding-left: var(--spacing-4);
          font-size: 12px;
          color: var(--color-red-700);
        }

        .pdf-optimizer__error-list li {
          margin-bottom: var(--spacing-1);
        }

        .pdf-optimizer__error-close {
          position: absolute;
          top: var(--spacing-6);
          right: var(--spacing-6);
          background: transparent;
          border: none;
          color: var(--color-red-600);
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .pdf-optimizer__error-close:hover {
          color: var(--color-red-900);
        }

        .pdf-optimizer__error-close .icon-medium {
          width: 20px;
          height: 20px;
        }

        /* === RESULTS === */
        .pdf-optimizer__results {
          animation: slideUp 0.5s ease-out;
        }

        .pdf-optimizer__results--success {
          margin-top: var(--spacing-12);
        }

        .pdf-optimizer__success-header {
          text-align: center;
          margin-bottom: var(--spacing-8);
        }

        .pdf-optimizer__success-icon {
          width: 64px;
          height: 64px;
          background: var(--color-green-100);
          border-radius: var(--border-radius-full);
          display: inline-block;
          margin-bottom: var(--spacing-4);
          position: relative;
        }

        .pdf-optimizer__success-icon .icon-large {
          width: 32px;
          height: 32px;
          color: var(--color-green-600);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pdf-optimizer__success-subtitle {
          font-size: 16px;
          color: var(--color-gray-500);
          font-weight: 300;
          margin: var(--spacing-2) 0 0 0;
        }

        .pdf-optimizer__stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-6);
          margin-bottom: var(--spacing-8);
        }

        .pdf-optimizer__stat {
          text-align: center;
        }

        .pdf-optimizer__stat-label {
          font-size: 14px;
          color: var(--color-gray-500);
          font-weight: 500;
          margin-bottom: var(--spacing-2);
        }

        .pdf-optimizer__stat-value {
          font-size: 36px;
          font-weight: 600;
          color: var(--color-black);
          line-height: 1;
        }

        .pdf-optimizer__stat-value--success {
          color: var(--color-green-600);
        }

        .pdf-optimizer__stat-value--capitalize {
          text-transform: capitalize;
        }

        .pdf-optimizer__stat-unit {
          font-size: 14px;
          color: var(--color-gray-500);
          margin-top: var(--spacing-1);
        }

        /* === RECOMMENDATIONS === */
        .pdf-optimizer__recommendations {
          background: var(--color-gray-50);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-6);
        }

        .pdf-optimizer__recommendations-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-black);
          margin: 0 0 var(--spacing-4) 0;
        }

        .pdf-optimizer__recommendations-list {
          display: block;
        }

        .pdf-optimizer__recommendation-item {
          display: block;
          margin-bottom: var(--spacing-2);
          font-size: 14px;
        }

        .pdf-optimizer__recommendation-item:last-child {
          margin-bottom: 0;
        }

        .pdf-optimizer__recommendation-mode {
          font-weight: 500;
          color: var(--color-gray-900);
          display: inline-block;
          width: 100px;
        }

        .pdf-optimizer__recommendation-value {
          color: var(--color-gray-600);
          display: inline-block;
        }

        /* === DOWNLOAD BUTTON === */
        .pdf-optimizer__download-btn {
          width: 100%;
          padding: var(--spacing-4) var(--spacing-8);
          background: var(--color-black);
          color: var(--color-white);
          border: none;
          border-radius: var(--border-radius-full);
          font-weight: 500;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-md);
          text-align: center;
        }

        .pdf-optimizer__download-btn:hover {
          background: var(--color-gray-900);
          box-shadow: var(--shadow-lg);
        }

        .pdf-optimizer__download-btn:active {
          transform: scale(0.98);
        }

        .pdf-optimizer__download-btn .icon-medium {
          width: 20px;
          height: 20px;
          vertical-align: middle;
          margin-right: var(--spacing-2);
          margin-top: -2px;
        }

        /* === ICON SIZES === */
        .icon-small {
          width: 16px;
          height: 16px;
        }

        .icon-medium {
          width: 20px;
          height: 20px;
        }

        .icon-large {
          width: 40px;
          height: 40px;
        }

        /* === ANIMATIONS === */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .pdf-optimizer__title {
            font-size: 48px;
          }

          .pdf-optimizer__subtitle {
            font-size: 18px;
          }

          .pdf-optimizer__mode-grid {
            grid-template-columns: 1fr;
          }

          .pdf-optimizer__stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .pdf-optimizer__error-content {
            width: calc(100% - 100px);
          }
        }

        /* === ACCESSIBILITY === */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid var(--color-black);
          outline-offset: 2px;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default PDFOptimizer;
