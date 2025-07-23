export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    ANALYZE_WEBSITE: '/api/v1/analyze',
    ANALYZE_PAGE: '/api/v1/analyze-page'
  },
  TIMEOUT: 300000 // 5 minutes for website analysis
} as const;
