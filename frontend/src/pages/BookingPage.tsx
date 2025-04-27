import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
// Import TextField for date input instead of DatePicker
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  AccessTime as AccessTimeIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsBike as DirectionsBikeIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import TourService, { Tour } from '../services/tour.service';
import BookingService, { CreateBookingData } from '../services/booking.service';
import { useAuth } from '../context/AuthContext';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'stripe'>('credit_card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [rentBike, setRentBike] = useState(false);
  const [bikeType, setBikeType] = useState('');
  const [bikeQuantity, setBikeQuantity] = useState(1);

  // Calculated values
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        if (id) {
          const tourData = await TourService.getTourById(id);
          setTour(tourData);
          setTotalPrice(tourData.price);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [id]);

  useEffect(() => {
    if (tour) {
      // Calculate total price
      let price = tour.price * numberOfPeople;

      // Add bike rental cost if applicable
      if (tour.type === 'bike' && rentBike && tour.bikeRental?.available) {
        price += (tour.bikeRental.price || 0) * bikeQuantity;
      }

      setTotalPrice(price);
    }
  }, [tour, numberOfPeople, rentBike, bikeQuantity]);

  const handleNumberOfPeopleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setNumberOfPeople(value);
    }
  };

  const handlePaymentMethodChange = (event: SelectChangeEvent) => {
    setPaymentMethod(event.target.value as 'credit_card' | 'paypal' | 'stripe');
  };

  const handleBikeTypeChange = (event: SelectChangeEvent) => {
    setBikeType(event.target.value);
  };

  const handleBikeQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setBikeQuantity(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      navigate('/login', { state: { from: `/tours/${id}/book` } });
      return;
    }

    if (!bookingDate) {
      setError('Please select a booking date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Prepare booking data
      const bookingData = {
        tourId: id!,
        date: bookingDate.toISOString(),
        numberOfPeople,
        paymentMethod,
        specialRequests: specialRequests || undefined,
      };

      // Add bike rental details if applicable
      if (tour?.type === 'bike' && rentBike && tour.bikeRental?.available) {
        bookingData.bikeRentalDetails = {
          rented: true,
          bikeType: bikeType || undefined,
          quantity: bikeQuantity,
        };
      }

      // If payment method is Stripe, redirect to payment page
      if (paymentMethod === 'stripe') {
        navigate('/payment', { state: { bookingData } });
        return;
      }

      // For other payment methods, create booking directly
      const createBookingData: CreateBookingData = {
        ...bookingData,
        paymentMethod: paymentMethod as 'credit_card' | 'paypal' | 'stripe',
      };

      const booking = await BookingService.createBooking(createBookingData);

      setSuccess('Booking created successfully!');

      // Redirect to booking details page after a short delay
      setTimeout(() => {
        navigate(`/bookings/${booking._id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const getTourIcon = (type: string) => {
    switch (type) {
      case 'walking':
        return <DirectionsWalkIcon />;
      case 'bus':
        return <DirectionsBusIcon />;
      case 'bike':
        return <DirectionsBikeIcon />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tour) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Tour not found</Alert>
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
        Book Your Tour
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Tour Details
            </Typography>
            <Grid container spacing={2} alignItems="center">
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    icon={getTourIcon(tour.type)}
                    label={tour.type.charAt(0).toUpperCase() + tour.type.slice(1)}
                    size="small"
                    color={
                      tour.type === 'walking'
                        ? 'primary'
                        : tour.type === 'bus'
                        ? 'secondary'
                        : 'success'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {Math.floor(tour.duration / 60) > 0
                        ? `${Math.floor(tour.duration / 60)}h ${tour.duration % 60}min`
                        : `${tour.duration}min`}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" paragraph>
                  {tour.description.length > 150
                    ? `${tour.description.substring(0, 150)}...`
                    : tour.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {tour.price} {tour.currency} per person
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Booking Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="bookingDate"
                  label="Tour Date"
                  type="date"
                  value={bookingDate ? bookingDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setBookingDate(new Date(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0],
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="numberOfPeople"
                  name="numberOfPeople"
                  label="Number of People"
                  type="number"
                  value={numberOfPeople}
                  onChange={handleNumberOfPeopleChange}
                  InputProps={{ inputProps: { min: 1, max: tour.maxGroupSize } }}
                  helperText={`Maximum group size: ${tour.maxGroupSize}`}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Select
                    labelId="payment-method-label"
                    id="payment-method"
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={handlePaymentMethodChange}
                  >
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="stripe">Stripe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Bike rental options for bike tours */}
              {tour.type === 'bike' && tour.bikeRental?.available && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Bike Rental Options
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rentBike}
                          onChange={(e) => setRentBike(e.target.checked)}
                        />
                      }
                      label={`Rent a bike (+${tour.bikeRental.price} ${tour.currency})`}
                    />
                  </Grid>

                  {rentBike && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel id="bike-type-label">Bike Type</InputLabel>
                          <Select
                            labelId="bike-type-label"
                            id="bike-type"
                            value={bikeType}
                            label="Bike Type"
                            onChange={handleBikeTypeChange}
                          >
                            {tour.bikeRental.options?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="bikeQuantity"
                          name="bikeQuantity"
                          label="Number of Bikes"
                          type="number"
                          value={bikeQuantity}
                          onChange={handleBikeQuantityChange}
                          InputProps={{ inputProps: { min: 1, max: numberOfPeople } }}
                          helperText="Cannot exceed number of people"
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="specialRequests"
                  name="specialRequests"
                  label="Special Requests"
                  multiline
                  rows={4}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or requests?"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => navigate(`/tours/${id}`)}
              >
                Back to Tour
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || !bookingDate}
              >
                {submitting ? <CircularProgress size={24} /> : 'Confirm Booking'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Booking Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1">
                  {tour.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tour.type.charAt(0).toUpperCase() + tour.type.slice(1)} Tour
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

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
                  {numberOfPeople}
                </Typography>
              </Box>

              {tour.type === 'bike' && rentBike && tour.bikeRental?.available && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">
                    Bike Rental ({bikeQuantity}):
                  </Typography>
                  <Typography variant="body1">
                    {(tour.bikeRental.price || 0) * bikeQuantity} {tour.currency}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">
                  Total:
                </Typography>
                <Typography variant="h6" color="primary">
                  {totalPrice} {tour.currency}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                * Booking is subject to availability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                * Free cancellation up to 24 hours before the tour
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingPage;
