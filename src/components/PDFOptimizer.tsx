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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header estilo Apple */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 mb-6 tracking-tight">
            Optimizador de PDF
          </h1>
          <p className="text-2xl text-gray-600 font-light mb-8">
            Reduce el tamaño de tus archivos hasta un <span className="font-semibold text-gray-900">85%</span>
          </p>
          <div className="inline-flex items-center gap-8 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> 
              Instantáneo
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> 
              Gratis
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 
              Sin IA
            </span>
          </div>
        </div>

        {/* Upload Area estilo Apple */}
        <div
          className={`relative rounded-3xl mb-12 text-center transition-all duration-500 ${
            dragActive 
              ? 'bg-blue-50 border-2 border-blue-500 scale-[1.02]' 
              : file 
              ? 'bg-white border-2 border-green-500 shadow-xl'
              : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && document.getElementById('file-input')?.click()}
        >
          <div className="p-16 cursor-pointer">
            {file ? (
              <div className="animate-slide-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">{file.name}</p>
                <p className="text-base text-gray-500 mb-8">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-10 h-10 transition-colors ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {dragActive ? 'Suelta tu archivo' : 'Arrastra un PDF'}
                </p>
                <p className="text-base text-gray-500 mb-4">
                  o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-400">
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
            className="hidden"
          />
        </div>

        {/* Mode Toggle estilo Apple */}
        <div className="flex gap-4 mb-12 bg-gray-100 p-2 rounded-2xl">
          <button
            onClick={() => setMode('analyze')}
            className={`flex-1 py-3.5 px-6 rounded-xl font-medium text-base transition-all duration-300 ${
              mode === 'analyze'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analizar
            </div>
          </button>
          <button
            onClick={() => setMode('optimize')}
            className={`flex-1 py-3.5 px-6 rounded-xl font-medium text-base transition-all duration-300 ${
              mode === 'optimize'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Optimizar
            </div>
          </button>
        </div>

        {/* Optimization Mode Selector estilo Apple */}
        {mode === 'optimize' && (
          <div className="bg-white rounded-3xl p-10 mb-12 border border-gray-200 shadow-sm animate-slide-down">
            <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
              Elige el nivel de compresión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['light', 'medium', 'aggressive'] as const).map((modeName) => {
                const isSelected = optimizationMode === modeName;
                
                return (
                  <button
                    key={modeName}
                    onClick={() => setOptimizationMode(modeName)}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {getModeIcon(modeName)}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                        {modeName === 'light' ? 'Ligero' : modeName === 'medium' ? 'Medio' : 'Agresivo'}
                      </div>
                      <div className="text-sm text-gray-500 leading-relaxed">
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
          <div className="mb-12 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-medium text-gray-900">
                  {mode === 'analyze' ? 'Analizando' : 'Optimizando'}
                </span>
                <span className="text-base font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center font-light">
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
          className={`w-full py-4 px-8 rounded-full font-medium text-base transition-all duration-300 ${
            !file || loading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando
            </span>
          ) : mode === 'analyze' ? (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analizar PDF
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Optimizar y Descargar
            </span>
          )}
        </button>

        {/* Error Message estilo Apple */}
        {error && (
          <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-900 mb-1">Algo salió mal</h3>
                <p className="text-sm text-red-700 font-light">{error}</p>
                <div className="mt-3 text-xs text-red-600 bg-white/50 px-3 py-2 rounded-lg">
                  <p className="font-medium mb-1">Intenta lo siguiente:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Verifica que sea un PDF válido</li>
                    <li>Prueba con un modo más ligero</li>
                    <li>Asegúrate que el archivo no esté dañado</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results estilo Apple */}
        {analysis && mode === 'analyze' && analysis.analysis && (
          <div className="mt-12 bg-white rounded-3xl p-10 border border-gray-200 shadow-sm animate-slide-up">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Análisis del PDF
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Tamaño</div>
                <div className="text-3xl font-semibold text-gray-900">
                  {analysis.analysis.file_size_mb}
                </div>
                <div className="text-sm text-gray-500">MB</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Páginas</div>
                <div className="text-3xl font-semibold text-gray-900">
                  {analysis.analysis.num_pages}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Imágenes</div>
                <div className="text-3xl font-semibold text-gray-900">
                  {analysis.analysis.num_images}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Potencial</div>
                <div className="text-3xl font-semibold text-gray-900 capitalize">
                  {analysis.analysis.optimization_potential === 'high' ? 'Alto' : 
                   analysis.analysis.optimization_potential === 'medium' ? 'Medio' : 'Bajo'}
                </div>
              </div>
            </div>

            {analysis.recommendations && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-base text-gray-900 mb-4">
                  Reducción estimada por modo
                </h4>
                <div className="space-y-2">
                  {Object.entries(analysis.recommendations).map(([mode, rec]) => (
                    <div key={mode} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {mode === 'light' ? 'Ligero' : mode === 'medium' ? 'Medio' : 'Agresivo'}
                      </span>
                      <span className="text-gray-600">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimization Results estilo Apple */}
        {analysis && mode === 'optimize' && analysis.optimizationStats && (
          <div className="mt-12 bg-white rounded-3xl p-10 border border-gray-200 shadow-sm animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Optimización completa
              </h3>
              <p className="text-base text-gray-500 font-light">Tu PDF ha sido reducido exitosamente</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Original</div>
                <div className="text-3xl font-semibold text-gray-900">
                  {analysis.optimizationStats.originalSizeMB}
                </div>
                <div className="text-sm text-gray-500">MB</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Optimizado</div>
                <div className="text-3xl font-semibold text-green-600">
                  {analysis.optimizationStats.optimizedSizeMB}
                </div>
                <div className="text-sm text-gray-500">MB</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Reducción</div>
                <div className="text-3xl font-semibold text-gray-900">
                  {analysis.optimizationStats.reductionPercent}
                </div>
                <div className="text-sm text-gray-500">%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Páginas</div>
                <div className="text-3xl font-semibold text-gray-900">
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
                className="w-full py-4 px-8 bg-gray-900 text-white rounded-full font-medium text-base hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar PDF Optimizado
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        /* Animaciones esenciales */
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        /* Responsive improvements */
        @media (max-width: 768px) {
          .text-6xl {
            font-size: 3rem;
          }
          
          .text-7xl {
            font-size: 3.5rem;
          }
          
          .text-2xl {
            font-size: 1.5rem;
          }
        }
        
        /* Mejora de accesibilidad y focus */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid rgb(17 24 39);
          outline-offset: 2px;
        }
        
        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default PDFOptimizer;
