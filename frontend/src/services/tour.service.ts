import api from './api';

export interface Tour {
  _id: string;
  name: string;
  description: string;
  type: 'walking' | 'bus' | 'bike';
  duration: number;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'difficult';
  price: number;
  currency: string;
  images: string[];
  startLocation: {
    type: string;
    coordinates: number[];
    address?: string;
    description?: string;
  };
  locations: Array<{
    type: string;
    coordinates: number[];
    address?: string;
    description?: string;
    day?: number;
  }>;
  busStops?: Array<{
    location: {
      type: string;
      coordinates: number[];
      address?: string;
      description?: string;
    };
    arrivalTime?: string;
    departureTime?: string;
  }>;
  bikeRental?: {
    available: boolean;
    price?: number;
    options?: string[];
  };
  audioGuide?: {
    available: boolean;
    languages?: string[];
  };
  maxGroupSize: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TourFilters {
  type?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  limit?: number;
  page?: number;
}

export interface TourResponse {
  tours: Tour[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface CreateTourData {
  name: string;
  description: string;
  type: 'walking' | 'bus' | 'bike';
  duration: number;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'difficult';
  price: number;
  currency: string;
  images: string[];
  startLocation: {
    type: string;
    coordinates: number[];
    address?: string;
    description?: string;
  };
  locations: Array<{
    type: string;
    coordinates: number[];
    address?: string;
    description?: string;
    day?: number;
  }>;
  busStops?: Array<{
    location: {
      type: string;
      coordinates: number[];
      address?: string;
      description?: string;
    };
    arrivalTime?: string;
    departureTime?: string;
  }>;
  bikeRental?: {
    available: boolean;
    price?: number;
    options?: string[];
  };
  audioGuide?: {
    available: boolean;
    languages?: string[];
  };
  maxGroupSize: number;
}

const TourService = {
  getAllTours: async (filters?: TourFilters): Promise<TourResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.sort) queryParams.append('sort', filters.sort);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.page) queryParams.append('page', filters.page.toString());
      }

      const response = await api.get(`/tours?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tours:", error);
      // Return empty data structure to prevent app from crashing
      return {
        tours: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
          limit: 10
        }
      };
    }
  },

  getTourById: async (id: string): Promise<Tour> => {
    const response = await api.get(`/tours/${id}`);
    return response.data;
  },

  getToursByType: async (type: string): Promise<Tour[]> => {
    const response = await api.get(`/tours/type/${type}`);
    return response.data;
  },

  searchTours: async (query: string): Promise<Tour[]> => {
    const response = await api.get(`/tours/search?query=${query}`);
    return response.data;
  },

  createTour: async (tourData: CreateTourData): Promise<Tour> => {
    const response = await api.post('/tours', tourData);
    return response.data;
  },

  updateTour: async (id: string, tourData: Partial<CreateTourData>): Promise<Tour> => {
    const response = await api.put(`/tours/${id}`, tourData);
    return response.data;
  },

  deleteTour: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tours/${id}`);
    return response.data;
  }
};

export default TourService;
