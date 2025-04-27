import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PaymentFormWrapper } from '../components/payment/StripePaymentForm';
import TourService from '../services/tour.service';
import BookingService from '../services/booking.service';
import { useAuth } from '../context/AuthContext';

const steps = ['Booking Details', 'Payment', 'Confirmation'];

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tour, setTour] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Get booking data from location state
  useEffect(() => {
    if (location.state && location.state.bookingData) {
      setBookingData(location.state.bookingData);
      
      // Fetch tour details
      const fetchTourData = async () => {
        try {
          setLoading(true);
          if (location.state.bookingData.tourId) {
            const tourData = await TourService.getTourById(location.state.bookingData.tourId);
            setTour(tourData);
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load tour details');
        } finally {
          setLoading(false);
        }
      };

      fetchTourData();
    } else {
      setError('No booking data provided');
      setLoading(false);
    }
  }, [location.state]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCancel = () => {
    navigate(`/tours/${bookingData?.tourId}`);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    // In a real implementation, this would be handled by the Stripe webhook
    // For demo purposes, we'll create a booking here
    const createBooking = async () => {
      try {
        setLoading(true);
        const response = await BookingService.createBooking({
          tourId: bookingData.tourId,
          date: bookingData.date,
          numberOfPeople: bookingData.numberOfPeople,
          paymentMethod: 'stripe',
          specialRequests: bookingData.specialRequests,
          bikeRentalDetails: bookingData.bikeRentalDetails
        });
        
        setBookingId(response._id);
        handleNext(); // Move to confirmation step
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create booking');
      } finally {
        setLoading(false);
      }
    };

    createBooking();
  };

  const calculateTotalPrice = () => {
    if (!tour || !bookingData) return 0;
    
    let total = tour.price * bookingData.numberOfPeople;
    
    // Add bike rental cost if applicable
    if (
      tour.type === 'bike' && 
      bookingData.bikeRentalDetails && 
      bookingData.bikeRentalDetails.rented && 
      tour.bikeRental?.available
    ) {
      total += (tour.bikeRental.price || 0) * bookingData.bikeRentalDetails.quantity;
    }
    
    return total;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          onClick={() => navigate('/tours')}
          sx={{ mt: 2 }}
        >
          Back to Tours
        </Button>
      </Box>
    );
  }

  if (!tour || !bookingData) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Missing tour or booking information</Alert>
        <Button
          onClick={() => navigate('/tours')}
          sx={{ mt: 2 }}
        >
          Back to Tours
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Complete Your Booking
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Booking Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box
                    component="img"
                    src={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://source.unsplash.com/random?travel'}
                    alt={tour.name}
                    sx={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{tour.name}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tour.type.charAt(0).toUpperCase() + tour.type.slice(1)} Tour
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Number of People:</strong> {bookingData.numberOfPeople}
                  </Typography>
                  {bookingData.bikeRentalDetails && bookingData.bikeRentalDetails.rented && (
                    <Typography variant="body2">
                      <strong>Bike Rental:</strong> {bookingData.bikeRentalDetails.quantity} {bookingData.bikeRentalDetails.bikeType || 'bikes'}
                    </Typography>
                  )}
                  {bookingData.specialRequests && (
                    <Typography variant="body2">
                      <strong>Special Requests:</strong> {bookingData.specialRequests}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Price Details
              </Typography>
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">
                    Tour Price:
                  </Typography>
                  <Typography variant="body1">
                    {tour.price} {tour.currency}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">
                    Number of People:
                  </Typography>
                  <Typography variant="body1">
                    {bookingData.numberOfPeople}
                  </Typography>
                </Box>
                {bookingData.bikeRentalDetails && bookingData.bikeRentalDetails.rented && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      Bike Rental ({bookingData.bikeRentalDetails.quantity}):
                    </Typography>
                    <Typography variant="body1">
                      {(tour.bikeRental?.price || 0) * bookingData.bikeRentalDetails.quantity} {tour.currency}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">
                    Total:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {calculateTotalPrice()} {tour.currency}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Payment Options
              </Typography>
              <Typography variant="body2" paragraph>
                We accept credit cards, PayPal, and other payment methods. Your payment information is secure and encrypted.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleNext}
                sx={{ mt: 2 }}
              >
                Proceed to Payment
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCancel}
                sx={{ mt: 2 }}
              >
                Cancel
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Box>
          <PaymentFormWrapper
            paymentData={{
              tourId: bookingData.tourId,
              numberOfPeople: bookingData.numberOfPeople,
              bikeRentalDetails: {
                ...bookingData.bikeRentalDetails,
                date: bookingData.date
              }
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={handleBack}
          />
        </Box>
      )}

      {activeStep === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="primary">
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for booking with TourGuide. Your tour is now confirmed.
          </Typography>
          <Typography variant="body1" paragraph>
            A confirmation email has been sent to your registered email address.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/bookings/${bookingId}`)}
              sx={{ mr: 2 }}
            >
              View Booking Details
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/tours')}
            >
              Browse More Tours
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PaymentPage;
