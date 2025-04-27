import api from './api';

export interface Itinerary {
  _id: string;
  name: string;
  user: {
    _id: string;
    username: string;
  } | string;
  startDate: string;
  endDate: string;
  description?: string;
  isPublic: boolean;
  days: Array<{
    date: string;
    activities: Array<{
      type: 'tour' | 'custom' | 'restaurant' | 'hotel' | 'transport';
      title: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      location?: {
        type: string;
        coordinates: number[];
        address?: string;
      };
      tour?: {
        _id: string;
        name: string;
        type: string;
        duration: number;
        price: number;
      } | string;
      booking?: {
        _id: string;
        date: string;
        numberOfPeople: number;
        status: string;
      } | string;
      notes?: string;
      cost?: number;
      currency?: string;
    }>;
    notes?: string;
    totalDistance?: number;
    estimatedTime?: number;
  }>;
  sharedWith: Array<{
    _id: string;
    username: string;
  } | string>;
  totalCost: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryResponse {
  itineraries: Itinerary[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface CreateItineraryData {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  isPublic?: boolean;
  days: Array<{
    date: string;
    activities: Array<{
      type: 'tour' | 'custom' | 'restaurant' | 'hotel' | 'transport';
      title: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      location?: {
        type: string;
        coordinates: number[];
        address?: string;
      };
      tour?: string;
      booking?: string;
      notes?: string;
      cost?: number;
      currency?: string;
    }>;
    notes?: string;
    totalDistance?: number;
    estimatedTime?: number;
  }>;
  sharedWith?: string[];
}

export interface AddTourToItineraryData {
  tourId: string;
  dayIndex: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

const ItineraryService = {
  getUserItineraries: async (): Promise<Itinerary[]> => {
    const response = await api.get('/itineraries');
    return response.data;
  },
  
  getItineraryById: async (id: string): Promise<Itinerary> => {
    const response = await api.get(`/itineraries/${id}`);
    return response.data;
  },
  
  createItinerary: async (itineraryData: CreateItineraryData): Promise<Itinerary> => {
    const response = await api.post('/itineraries', itineraryData);
    return response.data;
  },
  
  updateItinerary: async (id: string, itineraryData: Partial<CreateItineraryData>): Promise<Itinerary> => {
    const response = await api.put(`/itineraries/${id}`, itineraryData);
    return response.data;
  },
  
  deleteItinerary: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/itineraries/${id}`);
    return response.data;
  },
  
  addTourToItinerary: async (id: string, data: AddTourToItineraryData): Promise<Itinerary> => {
    const response = await api.post(`/itineraries/${id}/tour`, data);
    return response.data;
  },
  
  shareItinerary: async (id: string, userId: string): Promise<Itinerary> => {
    const response = await api.post(`/itineraries/${id}/share`, { userId });
    return response.data;
  },
  
  getPublicItineraries: async (
    filters?: {
      limit?: number;
      page?: number;
    }
  ): Promise<ItineraryResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.page) queryParams.append('page', filters.page.toString());
    }
    
    const response = await api.get(`/itineraries/public?${queryParams.toString()}`);
    return response.data;
  }
};

export default ItineraryService;
