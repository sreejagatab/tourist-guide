import api from './api';

export interface Review {
  _id: string;
  tour: {
    _id: string;
    name: string;
    type: string;
  } | string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  } | string;
  rating: number;
  valueRating?: number;
  experienceRating?: number;
  guideRating?: number;
  title: string;
  review: string;
  photos?: string[];
  videos?: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  response?: {
    text: string;
    date: string;
    user: {
      _id: string;
      username: string;
    } | string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  tourId: string;
  rating: number;
  valueRating?: number;
  experienceRating?: number;
  guideRating?: number;
  title: string;
  review: string;
  photos?: string[];
  videos?: string[];
}

const ReviewService = {
  getTourReviews: async (tourId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/tour/${tourId}`);
    return response.data;
  },
  
  getUserReviews: async (): Promise<Review[]> => {
    const response = await api.get('/reviews/user');
    return response.data;
  },
  
  createReview: async (reviewData: CreateReviewData): Promise<Review> => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  
  updateReview: async (id: string, reviewData: Partial<CreateReviewData>): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },
  
  deleteReview: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  
  voteReviewHelpful: async (id: string): Promise<Review> => {
    const response = await api.post(`/reviews/${id}/helpful`);
    return response.data;
  },
  
  addReviewResponse: async (id: string, text: string): Promise<Review> => {
    const response = await api.post(`/reviews/${id}/response`, { text });
    return response.data;
  }
};

export default ReviewService;
