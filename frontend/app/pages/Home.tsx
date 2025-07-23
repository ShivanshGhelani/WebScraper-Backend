import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAnalyzer } from '~/services/analyzerService';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<'site' | 'page'>('site');
  const [maxPagesToCount, setMaxPagesToCount] = useState<number>(500);
  const [maxPagesToAnalyze, setMaxPagesToAnalyze] = useState<number>(20);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { analyzeSite, analyzeSinglePage, isLoading, error } = useAnalyzer();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (analysisType === 'site') {
        const result = await analyzeSite(url, maxPagesToCount, maxPagesToAnalyze);
        const state = { analysis: result, type: 'site' };
        navigate(`/result?state=${encodeURIComponent(JSON.stringify(state))}`);
      } else {
        const result = await analyzeSinglePage(url);
        const state = { analysis: result, type: 'page' };
        navigate(`/result?state=${encodeURIComponent(JSON.stringify(state))}`);
      }
    } catch (err) {
      // Error is handled by the useAnalyzer hook
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Website Analyzer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Analyze websites and web pages to extract meta information, heading structure, 
              and discover external links with powerful insights.
            </p>
          </div>
          
          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Analysis Type Selection */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Choose Analysis Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAnalysisType('site')}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      analysisType === 'site'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold mb-2">Full Website</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Crawl and analyze multiple pages from a website
                      </p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAnalysisType('page')}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      analysisType === 'page'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold mb-2">Single Page</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Analyze a specific page without crawling
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="url" 
                  className="block text-lg font-semibold text-gray-700 dark:text-gray-200"
                >
                  {analysisType === 'site' ? 'Website Domain' : 'Page URL'}
                </label>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={analysisType === 'site' ? 'example.com' : 'https://example.com/page'}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {analysisType === 'site' 
                    ? 'Enter just the domain (e.g., example.com)'
                    : 'Enter the complete URL including protocol (e.g., https://example.com/page)'
                  }
                </p>
              </div>

              {/* Advanced Options for Website Analysis */}
              {analysisType === 'site' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Advanced Options
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced
                    </button>
                  </div>
                  
                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div>
                        <label 
                          htmlFor="maxCount" 
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Max Pages to Count
                        </label>
                        <input
                          type="number"
                          id="maxCount"
                          value={maxPagesToCount}
                          onChange={(e) => setMaxPagesToCount(parseInt(e.target.value) || 500)}
                          min="1"
                          max="1000"
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum pages to discover (default: 500)
                        </p>
                      </div>
                      
                      <div>
                        <label 
                          htmlFor="maxAnalyze" 
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Max Pages to Analyze
                        </label>
                        <input
                          type="number"
                          id="maxAnalyze"
                          value={maxPagesToAnalyze}
                          onChange={(e) => setMaxPagesToAnalyze(parseInt(e.target.value) || 20)}
                          min="1"
                          max="100"
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum pages to analyze in detail (default: 20)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      <strong>Error:</strong> {error.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {analysisType === 'site' ? 'Crawling website and analyzing pages...' : 'Analyzing page...'}
                  </>
                ) : (
                  'Start Analysis'
                )}
              </button>
              
              {/* Additional loading info */}
              {isLoading && analysisType === 'site' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-blue-800 dark:text-blue-300 text-sm text-center">
                    <div className="font-medium mb-1">Analysis in progress...</div>
                    <div>This may take up to 2 minutes for larger websites. We're analyzing up to {maxPagesToAnalyze} pages in detail.</div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Meta Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Extract and analyze meta titles, descriptions, and other metadata</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Heading Structure</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Analyze heading hierarchy and content organization</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Link Discovery</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Find external links, social media links, and domain connections</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
