import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import PaymentService, { STRIPE_PUBLISHABLE_KEY, PaymentIntentData } from '../../services/payment.service';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface PaymentFormWrapperProps {
  paymentData: PaymentIntentData;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export const PaymentFormWrapper: React.FC<PaymentFormWrapperProps> = ({
  paymentData,
  onSuccess,
  onCancel,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await PaymentService.createPaymentIntent(paymentData);
        setClientSecret(response.clientSecret);
        setAmount(response.amount);
        setCurrency(response.currency);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [paymentData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onCancel}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!clientSecret) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to initialize payment
        </Alert>
        <Button variant="outlined" onClick={onCancel}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <StripePaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setPaymentError(result.error.message || 'Payment failed');
      setProcessing(false);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      onSuccess(result.paymentIntent.id);
    } else {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Amount
        </Typography>
        <Typography variant="h5">
          {formatCurrency(amount, currency)}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {paymentSuccess ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment successful! Your booking is confirmed.
          </Alert>
          <Button
            variant="contained"
            onClick={() => onSuccess('payment-completed')}
          >
            View Booking Details
          </Button>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          
          {paymentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {paymentError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!stripe || processing}
            >
              {processing ? <CircularProgress size={24} /> : `Pay ${formatCurrency(amount, currency)}`}
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
};

export default StripePaymentForm;
