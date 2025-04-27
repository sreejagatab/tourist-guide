import api from './api';
import { Tour } from './tour.service';

export interface Booking {
  _id: string;
  tour: Tour | string;
  user: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | string;
  price: number;
  date: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId?: string;
  paymentMethod: 'credit_card' | 'paypal' | 'stripe';
  ticketCode: string;
  specialRequests?: string;
  bikeRentalDetails?: {
    rented: boolean;
    bikeType?: string;
    quantity?: number;
    rentalPrice?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface CreateBookingData {
  tourId: string;
  date: string;
  numberOfPeople: number;
  paymentMethod: 'credit_card' | 'paypal' | 'stripe';
  specialRequests?: string;
  bikeRentalDetails?: {
    rented: boolean;
    bikeType?: string;
    quantity?: number;
  };
}

const BookingService = {
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/user');
    return response.data;
  },
  
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  updateBookingStatus: async (id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },
  
  // Admin only
  getAllBookings: async (
    filters?: {
      status?: string;
      tourId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    }
  ): Promise<BookingResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.tourId) queryParams.append('tourId', filters.tourId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.page) queryParams.append('page', filters.page.toString());
    }
    
    const response = await api.get(`/bookings?${queryParams.toString()}`);
    return response.data;
  }
};

export default BookingService;
