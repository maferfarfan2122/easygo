import { useState } from 'react';
import { Upload, FileText, Download, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const PDFOptimizer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [optimizedPdfUrl, setOptimizedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('optimize'); // 'optimize' or 'analyze'

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
      const response = await fetch(`${API_URL}/api/tools/pdf-optimizer`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`);
      }

      // Obtener headers con info
      const processingTime = response.headers.get('X-Processing-Time');
      const atsScore = response.headers.get('X-Original-ATS-Score');
      const weakVerbsFixed = response.headers.get('X-Weak-Verbs-Fixed');
      const actionVerbsAdded = response.headers.get('X-Action-Verbs-Added');

      // Crear URL del PDF optimizado
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setOptimizedPdfUrl(url);

      // Mostrar info de optimización
      setAnalysis({
        success: true,
        analysis: {
          ats_score: parseInt(atsScore) || 0,
          weak_verbs_found: parseInt(weakVerbsFixed) || 0,
          missing_action_verbs: parseInt(actionVerbsAdded) || 0
        },
        processing_time: processingTime || '2s'
      });

    } catch (err) {
      setError(err.message || 'Error optimizing PDF');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF Optimizer
          </h1>
          <p className="text-xl text-gray-600">
            Upload your CV PDF and optimize it with AI-powered rules
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            100% Free • No AI Tokens • 2-3 seconds
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setMode('optimize')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'optimize'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Optimize PDF
          </button>
          <button
            onClick={() => setMode('analyze')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'analyze'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Analyze Only
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {file ? file.name : 'Drop your CV PDF here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                PDF files only • Max 10MB
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-6 flex gap-4 justify-center">
              {mode === 'optimize' ? (
                <button
                  onClick={handleOptimize}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 inline mr-2" />
                      Optimize PDF
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 inline mr-2" />
                      Analyze PDF
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
            
            {/* ATS Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">ATS Compatibility Score</span>
                <span className={`text-3xl font-bold ${getScoreColor(analysis.analysis.ats_score)}`}>
                  {analysis.analysis.ats_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    analysis.analysis.ats_score >= 80 ? 'bg-green-500' :
                    analysis.analysis.ats_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.analysis.ats_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {getScoreLabel(analysis.analysis.ats_score)}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700 mb-1">
                  {analysis.analysis.weak_verbs_found}
                </div>
                <div className="text-sm text-yellow-600">Weak Verbs Found</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {analysis.analysis.missing_action_verbs}
                </div>
                <div className="text-sm text-blue-600">Missing Action Verbs</div>
              </div>
            </div>

            {/* Suggestions */}
            {analysis.analysis.optimization_suggestions && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Optimization Suggestions:</h3>
                <ul className="space-y-2">
                  {analysis.analysis.optimization_suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-purple-700">
                      <span className="mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Processing Time */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Processed in {analysis.processing_time}
            </div>
          </div>
        )}

        {/* Download Optimized PDF */}
        {optimizedPdfUrl && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border-2 border-green-200">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PDF Optimized Successfully! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Your CV has been optimized with action verbs and ATS-friendly formatting
              </p>
              <a
                href={optimizedPdfUrl}
                download={`optimized_${file.name}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Download Optimized PDF
              </a>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Optimization</h3>
            <p className="text-sm text-gray-600">
              Replaces weak verbs with powerful action verbs automatically
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ATS-Friendly</h3>
            <p className="text-sm text-gray-600">
              Ensures your CV passes Applicant Tracking Systems
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Free</h3>
            <p className="text-sm text-gray-600">
              No AI tokens required. Pure Python optimization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFOptimizer;
