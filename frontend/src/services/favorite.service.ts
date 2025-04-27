import api from './api';
import { Tour } from './tour.service';
import { Itinerary } from './itinerary.service';

export interface FavoritesResponse {
  tours: Tour[];
}

export interface FavoriteItinerariesResponse {
  itineraries: Itinerary[];
}

export interface FavoriteStatusResponse {
  isFavorite: boolean;
}

const FavoriteService = {
  // Tour favorites
  getFavoriteTours: async (): Promise<Tour[]> => {
    const response = await api.get('/favorites/tours');
    return response.data.tours;
  },
  
  addTourToFavorites: async (tourId: string): Promise<{ message: string; tourId: string }> => {
    const response = await api.post(`/favorites/tours/${tourId}`);
    return response.data;
  },
  
  removeTourFromFavorites: async (tourId: string): Promise<{ message: string; tourId: string }> => {
    const response = await api.delete(`/favorites/tours/${tourId}`);
    return response.data;
  },
  
  checkTourInFavorites: async (tourId: string): Promise<boolean> => {
    const response = await api.get(`/favorites/tours/${tourId}/check`);
    return response.data.isFavorite;
  },
  
  // Itinerary favorites
  getFavoriteItineraries: async (): Promise<Itinerary[]> => {
    const response = await api.get('/favorites/itineraries');
    return response.data.itineraries;
  },
  
  addItineraryToFavorites: async (itineraryId: string): Promise<{ message: string; itineraryId: string }> => {
    const response = await api.post(`/favorites/itineraries/${itineraryId}`);
    return response.data;
  },
  
  removeItineraryFromFavorites: async (itineraryId: string): Promise<{ message: string; itineraryId: string }> => {
    const response = await api.delete(`/favorites/itineraries/${itineraryId}`);
    return response.data;
  }
};

export default FavoriteService;
