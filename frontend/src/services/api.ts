import axios from 'axios';

// Get base URL from environment variable
// Local default: http://localhost:8000/api
// Vercel production: /api (relative URL sharing the same domain)
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed;
  }
  // Default to relative /api in production or localhost in development
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export interface ClassifiedReview {
  id: number;
  review: string;
  sentiment: 'Positive' | 'Negative';
  confidence: number;
  created_at: string;
}

export interface DashboardStats {
  total_reviews: number;
  positive_reviews: number;
  negative_reviews: number;
  model_accuracy: number;
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
}

export interface RatingDistribution {
  available: boolean;
  ratings: Array<{ rating: string; count: number }>;
  message?: string;
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await apiClient.get<{ status: string }>('/health');
    return response.data;
  } catch (error) {
    throw new Error('API server is not responding.');
  }
}

/**
 * Classifies a hotel review by sending it to the FastAPI backend ML model.
 */
export async function classifyReview(review: string): Promise<ClassifiedReview> {
  try {
    const response = await apiClient.post<ClassifiedReview>('/reviews/classify', {
      review: review.trim(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Unable to connect to the classification server. Please try again.');
  }
}

/**
 * Fetches aggregated review statistics and ML model accuracy from the backend.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve dashboard statistics from the server.');
  }
}

/**
 * Fetches positive and negative review distribution counts from the backend.
 */
export async function getSentimentDistribution(): Promise<SentimentDistribution> {
  try {
    const response = await apiClient.get<SentimentDistribution>('/dashboard/sentiment-distribution');
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve sentiment distribution from the server.');
  }
}

/**
 * Fetches the 10 most recent reviews classified and saved to the backend database.
 */
export async function getRecentReviews(): Promise<ClassifiedReview[]> {
  try {
    const response = await apiClient.get<ClassifiedReview[]>('/reviews/recent');
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve recent classifications from the server.');
  }
}

/**
 * Fetches rating distribution metadata from the backend.
 */
export async function getRatingDistribution(): Promise<RatingDistribution> {
  try {
    const response = await apiClient.get<RatingDistribution>('/dashboard/rating-distribution');
    return response.data;
  } catch (error) {
    return {
      available: false,
      ratings: [],
      message: 'Rating information is currently unavailable.',
    };
  }
}

export default {
  checkHealth,
  classifyReview,
  getDashboardStats,
  getSentimentDistribution,
  getRecentReviews,
  getRatingDistribution,
};
