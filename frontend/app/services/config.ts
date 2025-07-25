// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in Electron
  if (typeof window !== 'undefined' && (window as any).isElectron) {
    // In Electron, use the Vercel deployed backend
    return import.meta.env.VITE_API_URL || 'https://cawebscraper.vercel.app';
  }
  
  // For web development and production, use the backend API
  return import.meta.env.VITE_API_URL || 'https://cawebscraper.vercel.app';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    ANALYZE_WEBSITE: '/api/v1/analyze',
    ANALYZE_PAGE: '/api/v1/analyze-page'
  },
  TIMEOUT: 300000 // 5 minutes for website analysis
} as const;
