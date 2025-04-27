import api from './api';

// Replace with your actual Stripe publishable key
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key';

export interface PaymentIntentData {
  tourId: string;
  numberOfPeople: number;
  bikeRentalDetails?: {
    rented: boolean;
    bikeType?: string;
    quantity?: number;
    date?: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

const PaymentService = {
  createPaymentIntent: async (data: PaymentIntentData): Promise<PaymentIntentResponse> => {
    const response = await api.post('/payments/create-payment-intent', data);
    return response.data;
  }
};

export default PaymentService;
