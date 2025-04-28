import api from './api';

export interface Recommendation {
  _id: string;
  name: string;
  duration: number;
  difficulty: string;
  price: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startLocation: {
    description: string;
    address: string;
    coordinates: [number, number];
  };
  ratingsAverage: number;
  ratingsQuantity: number;
  type: string;
  distance: number;
  maxGroupSize: number;
  relevanceScore?: number;
}

export interface RecommendationResponse {
  status: string;
  results: number;
  data: {
    recommendations: Recommendation[];
  };
}

export interface TourResponse {
  status: string;
  results: number;
  data: {
    tours: Recommendation[];
  };
}

/**
 * Service for fetching tour recommendations
 */
const RecommendationService = {
  /**
   * Get personalized recommendations for the authenticated user
   * @param limit Maximum number of recommendations to fetch
   * @returns Promise with personalized recommendations
   */
  getPersonalizedRecommendations: async (limit: number = 5): Promise<RecommendationResponse> => {
    try {
      const response = await api.get(`/recommendations/personalized?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      // Return empty data structure to prevent app from crashing
      return {
        status: 'error',
        results: 0,
        data: {
          recommendations: []
        }
      };
    }
  },

  /**
   * Get popular tours for new users or as fallback
   * @param limit Maximum number of tours to fetch
   * @returns Promise with popular tours
   */
  getPopularTours: async (limit: number = 5): Promise<TourResponse> => {
    try {
      const response = await api.get(`/recommendations/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular tours:', error);
      // Return empty data structure to prevent app from crashing
      return {
        status: 'error',
        results: 0,
        data: {
          tours: []
        }
      };
    }
  },

  /**
   * Get similar tours to a specific tour
   * @param tourId ID of the tour to find similar tours for
   * @param limit Maximum number of similar tours to fetch
   * @returns Promise with similar tours
   */
  getSimilarTours: async (tourId: string, limit: number = 4): Promise<TourResponse> => {
    try {
      const response = await api.get(`/recommendations/similar/${tourId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar tours:', error);
      // Return empty data structure to prevent app from crashing
      return {
        status: 'error',
        results: 0,
        data: {
          tours: []
        }
      };
    }
  }
};

export default RecommendationService;
