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

  const getModeColor = (modeName: OptimizationModeType): string => {
    switch(modeName) {
      case 'light': return 'blue';
      case 'medium': return 'green';
      case 'aggressive': return 'red';
      default: return 'gray';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header mejorado */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Optimizador de PDF
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Reduce el tamaño de cualquier PDF hasta un <span className="font-bold text-pink-600">85%</span>
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Zap className="w-4 h-4 text-yellow-500" /> 
              <span className="font-medium">Ultra rápido</span>
            </span>
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <CheckCircle className="w-4 h-4 text-green-500" /> 
              <span className="font-medium">100% GRATIS</span>
            </span>
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-500" /> 
              <span className="font-medium">Sin IA</span>
            </span>
          </div>
        </div>

        {/* Upload Area mejorada */}
        <div
          className={`relative border-3 border-dashed rounded-2xl p-12 mb-8 text-center transition-all duration-300 cursor-pointer ${
            dragActive 
              ? 'border-purple-500 bg-purple-50 scale-105 shadow-2xl' 
              : file 
              ? 'border-green-400 bg-green-50 shadow-lg'
              : 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-xl hover:scale-102'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && document.getElementById('file-input')?.click()}
        >
          {file ? (
            <div className="animate-slide-up">
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-16 h-16 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-2">{file.name}</p>
              <p className="text-lg text-gray-600 mb-4">
                📦 {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Quitar archivo
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <Upload className={`w-16 h-16 mx-auto mb-4 transition-transform ${dragActive ? 'scale-110 text-purple-600' : 'text-gray-400'}`} />
              <p className="text-2xl font-semibold text-gray-700 mb-2">
                {dragActive ? '¡Suelta aquí!' : 'Arrastra tu PDF aquí'}
              </p>
              <p className="text-gray-500 mb-4">
                o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-400">
                Cualquier tipo de PDF: facturas, reportes, CVs, contratos, etc.
              </p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Mode Toggle mejorado */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setMode('analyze')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
              mode === 'analyze'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Solo Analizar
            </div>
          </button>
          <button
            onClick={() => setMode('optimize')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
              mode === 'optimize'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Optimizar & Descargar
            </div>
          </button>
        </div>

        {/* Optimization Mode Selector mejorado */}
        {mode === 'optimize' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 mb-8 border-2 border-gray-100 shadow-lg animate-slide-down">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Gauge className="w-6 h-6 text-purple-600" />
              Modo de Optimización:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['light', 'medium', 'aggressive'] as const).map((modeName) => (
                <button
                  key={modeName}
                  onClick={() => setOptimizationMode(modeName)}
                  className={`group relative p-6 rounded-xl border-3 transition-all duration-300 ${
                    optimizationMode === modeName
                      ? `border-${getModeColor(modeName)}-500 bg-gradient-to-br from-${getModeColor(modeName)}-50 to-${getModeColor(modeName)}-100 shadow-xl scale-105`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:scale-102'
                  }`}
                >
                  {optimizationMode === modeName && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      optimizationMode === modeName 
                        ? `bg-${getModeColor(modeName)}-500 text-white` 
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                      {getModeIcon(modeName)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold capitalize mb-2 ${
                      optimizationMode === modeName 
                        ? `text-${getModeColor(modeName)}-700` 
                        : 'text-gray-700'
                    }`}>
                      {modeName === 'light' ? 'Ligero' : modeName === 'medium' ? 'Medio' : 'Agresivo'}
                    </div>
                    <div className="text-sm text-gray-600 leading-tight">
                      {getModeDescription(modeName)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-gray-700">
                  {mode === 'analyze' ? 'Analizando...' : 'Optimizando...'}
                </span>
                <span className="text-lg font-bold text-purple-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button mejorado */}
        <button
          onClick={mode === 'analyze' ? handleAnalyze : handleOptimize}
          disabled={!file || loading}
          className={`w-full py-5 px-8 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : mode === 'analyze'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-2xl hover:scale-105'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-2xl hover:scale-105'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </span>
          ) : mode === 'analyze' ? (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Analizar PDF
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              Optimizar & Descargar ({optimizationMode})
            </span>
          )}
        </button>

        {/* Error Message mejorado */}
        {error && (
          <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl shadow-lg animate-shake">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
                <div className="mt-3 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                  <strong>💡 Sugerencias:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>Verifica que el archivo sea un PDF válido</li>
                    <li>Intenta con un modo de optimización más ligero</li>
                    <li>Asegúrate que el PDF no esté dañado</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results mejorado */}
        {analysis && mode === 'analyze' && analysis.analysis && (
          <div className="mt-8 bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-xl animate-slide-up">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              Análisis del PDF
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">Tamaño</div>
                <div className="text-3xl font-bold text-blue-600">
                  {analysis.analysis.file_size_mb} MB
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                <div className="text-sm text-purple-700 font-medium mb-1">Páginas</div>
                <div className="text-3xl font-bold text-purple-600">
                  {analysis.analysis.num_pages}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                <div className="text-sm text-green-700 font-medium mb-1">Imágenes</div>
                <div className="text-3xl font-bold text-green-600">
                  {analysis.analysis.num_images}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200">
                <div className="text-sm text-orange-700 font-medium mb-1">Potencial</div>
                <div className="text-3xl font-bold text-orange-600 capitalize">
                  {analysis.analysis.optimization_potential === 'high' ? 'Alto' : 
                   analysis.analysis.optimization_potential === 'medium' ? 'Medio' : 'Bajo'}
                </div>
              </div>
            </div>

            {analysis.recommendations && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Reducción Estimada:
                </h4>
                <div className="space-y-3">
                  {Object.entries(analysis.recommendations).map(([mode, rec]) => (
                    <div key={mode} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                      <span className="font-semibold capitalize text-gray-700">
                        {mode === 'light' ? '🟦 Ligero' : mode === 'medium' ? '🟩 Medio' : '🟥 Agresivo'}:
                      </span>
                      <span className="text-gray-600">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimization Results mejorado */}
        {analysis && mode === 'optimize' && analysis.optimizationStats && (
          <div className="mt-8 bg-white rounded-2xl p-8 border-2 border-green-100 shadow-xl animate-slide-up">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Optimización Completada!
              </h3>
              <p className="text-gray-600">Tu PDF ha sido reducido exitosamente</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">Original</div>
                <div className="text-3xl font-bold text-blue-600">
                  {analysis.optimizationStats.originalSizeMB} MB
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                <div className="text-sm text-green-700 font-medium mb-1">Optimizado</div>
                <div className="text-3xl font-bold text-green-600">
                  {analysis.optimizationStats.optimizedSizeMB} MB
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                <div className="text-sm text-purple-700 font-medium mb-1">Reducción</div>
                <div className="text-3xl font-bold text-purple-600">
                  {analysis.optimizationStats.reductionPercent}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200">
                <div className="text-sm text-orange-700 font-medium mb-1">Páginas</div>
                <div className="text-3xl font-bold text-orange-600">
                  {analysis.optimizationStats.pages}
                </div>
              </div>
            </div>

            {optimizedPdfUrl && file && (
              <a
                href={optimizedPdfUrl}
                download={`optimized_${optimizationMode}_${file.name}`}
                className="flex items-center justify-center gap-3 w-full py-5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <Download className="w-6 h-6" />
                Descargar PDF Optimizado
              </a>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PDFOptimizer;
