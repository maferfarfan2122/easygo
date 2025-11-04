import { useState } from 'react';
import { Upload, FileText, Download, TrendingUp, AlertCircle, CheckCircle, Zap, Image as ImageIcon } from 'lucide-react';

const PDFOptimizer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [optimizedPdfUrl, setOptimizedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('analyze'); // 'analyze' or 'optimize'
  const [optimizationMode, setOptimizationMode] = useState('medium'); // 'light', 'medium', 'aggressive'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
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

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setAnalysis(null);
      setOptimizedPdfUrl(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/tools/pdf-analyzer`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Error analyzing PDF');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);
    setOptimizedPdfUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/tools/pdf-optimizer?mode=${optimizationMode}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`);
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

      // Mostrar estadísticas de optimización
      setAnalysis({
        success: true,
        optimizationStats: {
          processingTime,
          originalSizeMB: parseFloat(originalSizeMB) || 0,
          optimizedSizeMB: parseFloat(optimizedSizeMB) || 0,
          reductionPercent: parseFloat(reductionPercent) || 0,
          imagesCompressed: parseInt(imagesCompressed) || 0,
          pages: parseInt(pages) || 0,
          mode: optimizationMode
        }
      });

      // Auto-descargar el PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized_${optimizationMode}_${file.name}`;
      link.click();
    } catch (err) {
      setError(err.message || 'Error optimizing PDF');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModeColor = (modeName) => {
    switch(modeName) {
      case 'light': return 'blue';
      case 'medium': return 'green';
      case 'aggressive': return 'red';
      default: return 'gray';
    }
  };

  const getModeDescription = (modeName) => {
    switch(modeName) {
      case 'light': return '120 DPI • 50-60% reduction • Good quality';
      case 'medium': return '96 DPI • 65-75% reduction • Balanced';
      case 'aggressive': return '72 DPI • 75-85% reduction • Max compression';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📄 PDF Optimizer
          </h1>
          <p className="text-lg text-gray-600">
            Compress any PDF • Keep quality • 100% FREE
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" /> 2-5 seconds
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Universal
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> No AI
            </span>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {file ? (
            <div>
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-2">
                Drop your PDF here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Any type of PDF: invoices, reports, CVs, contracts, etc.
              </p>
            </>
          )}
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('analyze')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              mode === 'analyze'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            📊 Analyze Only
          </button>
          <button
            onClick={() => setMode('optimize')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              mode === 'optimize'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            ⚡ Optimize & Download
          </button>
        </div>

        {/* Optimization Mode Selector (only in optimize mode) */}
        {mode === 'optimize' && (
          <div className="bg-white rounded-lg p-6 mb-6 border-2 border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Optimization Mode:</h3>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'medium', 'aggressive'].map((modeName) => (
                <button
                  key={modeName}
                  onClick={() => setOptimizationMode(modeName)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    optimizationMode === modeName
                      ? `border-${getModeColor(modeName)}-500 bg-${getModeColor(modeName)}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-bold capitalize mb-1 text-${getModeColor(modeName)}-600`}>
                      {modeName}
                    </div>
                    <div className="text-xs text-gray-600 leading-tight">
                      {getModeDescription(modeName)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={mode === 'analyze' ? handleAnalyze : handleOptimize}
          disabled={!file || loading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : mode === 'analyze'
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : mode === 'analyze' ? (
            '📊 Analyze PDF'
          ) : (
            `⚡ Optimize (${optimizationMode})`
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && mode === 'analyze' && analysis.analysis && (
          <div className="mt-6 bg-white rounded-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              PDF Analysis
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">File Size</div>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.analysis.file_size_mb} MB
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Pages</div>
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.analysis.num_pages}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Images</div>
                <div className="text-2xl font-bold text-green-600">
                  {analysis.analysis.num_images}
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Optimization Potential</div>
                <div className="text-2xl font-bold text-orange-600 capitalize">
                  {analysis.analysis.optimization_potential}
                </div>
              </div>
            </div>

            {analysis.recommendations && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-gray-900">Recommendations:</h4>
                {Object.entries(analysis.recommendations).map(([mode, rec]) => (
                  <div key={mode} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                    <span className="font-medium capitalize">{mode}:</span> {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Optimization Results */}
        {analysis && mode === 'optimize' && analysis.optimizationStats && (
          <div className="mt-6 bg-white rounded-lg p-6 border-2 border-green-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Optimization Complete!
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Original Size</div>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.optimizationStats.originalSizeMB} MB
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Optimized Size</div>
                <div className="text-2xl font-bold text-green-600">
                  {analysis.optimizationStats.optimizedSizeMB} MB
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Reduction</div>
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.optimizationStats.reductionPercent}%
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Images Compressed</div>
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.optimizationStats.imagesCompressed}
                </div>
              </div>
            </div>

            {optimizedPdfUrl && (
              <a
                href={optimizedPdfUrl}
                download={`optimized_${optimizationMode}_${file.name}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download Optimized PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFOptimizer;
