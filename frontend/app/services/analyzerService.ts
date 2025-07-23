import { useState } from 'react';
import { API_CONFIG } from './config';
import type { WebsiteAnalysis, PageAnalysis, WebsiteAnalyzeRequest, SinglePageAnalyzeRequest } from './types';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(data.detail || 'An error occurred', response.status);
  }
  
  return data as T;
}

async function makeRequest<T>(url: string, options: RequestInit, retryCount = 3): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retryCount > 0) {
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return makeRequest<T>(url, options, retryCount - 1);
      }
      throw new ApiError('Network error - please check your connection and try again', 0);
    }
    
    // Handle timeout/abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'The website analysis is taking longer than expected. This could be because:\n' +
        '1. The website is slow to respond\n' +
        '2. There are many pages to analyze\n' +
        'Try:\n' +
        '• Analyzing fewer pages (use Advanced Options)\n' +
        '• Using single page analysis instead\n' +
        '• Trying again later',
        408
      );
    }
    
    // Rethrow any other errors
    if (error instanceof Error) {
      throw new ApiError(error.message, 500);
    }
    throw error;
  }
}

export class AnalyzerService {
  private static instance: AnalyzerService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  public static getInstance(): AnalyzerService {
    if (!AnalyzerService.instance) {
      AnalyzerService.instance = new AnalyzerService();
    }
    return AnalyzerService.instance;
  }

  /**
   * Analyze an entire website
   * @param domain - The domain to analyze (e.g., "example.com")
   * @param max_pages_to_count - Maximum number of pages to count
   * @param max_pages_to_analyze - Maximum number of pages to analyze in detail
   */
  async analyzeWebsite(
    domain: string, 
    max_pages_to_count?: number, 
    max_pages_to_analyze?: number
  ): Promise<WebsiteAnalysis> {
    const url = new URL(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYZE_WEBSITE}`);
    
    // Add query parameters if provided
    if (max_pages_to_count !== undefined) {
      url.searchParams.append('max_pages_to_count', max_pages_to_count.toString());
    }
    if (max_pages_to_analyze !== undefined) {
      url.searchParams.append('max_pages_to_analyze', max_pages_to_analyze.toString());
    }

    return makeRequest<WebsiteAnalysis>(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });
  }

  /**
   * Analyze a single page
   * @param url - The complete URL of the page to analyze
   */
  async analyzePage(url: string): Promise<PageAnalysis> {
    return makeRequest<PageAnalysis>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYZE_PAGE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });
  }
}

// Create a singleton instance for easy import
export const analyzerService = AnalyzerService.getInstance();

// Custom hook for handling API state
export function useAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const analyzeSite = async (domain: string, max_pages_to_count?: number, max_pages_to_analyze?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzerService.analyzeWebsite(domain, max_pages_to_count, max_pages_to_analyze);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSinglePage = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzerService.analyzePage(url);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeSite,
    analyzeSinglePage,
    isLoading,
    error,
  };
}
