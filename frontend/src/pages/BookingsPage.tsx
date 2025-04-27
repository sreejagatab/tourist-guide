import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsBike as DirectionsBikeIcon,
} from '@mui/icons-material';
import BookingService, { Booking } from '../services/booking.service';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bookings-tabpanel-${index}`}
      aria-labelledby={`bookings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsData = await BookingService.getUserBookings();
        setBookings(bookingsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await BookingService.updateBookingStatus(bookingId, 'cancelled');
        
        // Update the booking status in the state
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        ));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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

  const filteredBookings = (status: string) => {
    return bookings.filter(booking => 
      typeof booking !== 'string' && booking.status === status
    );
  };

  const upcomingBookings = bookings.filter(booking => 
    typeof booking !== 'string' && 
    (booking.status === 'confirmed' || booking.status === 'pending') && 
    new Date(booking.date) >= new Date()
  );

  const pastBookings = bookings.filter(booking => 
    typeof booking !== 'string' && 
    (booking.status === 'confirmed' || booking.status === 'cancelled') && 
    new Date(booking.date) < new Date()
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="booking tabs"
          variant="fullWidth"
        >
          <Tab label="Upcoming" id="bookings-tab-0" />
          <Tab label="Past" id="bookings-tab-1" />
          <Tab label="All Bookings" id="bookings-tab-2" />
        </Tabs>

        {/* Upcoming Bookings Tab */}
        <TabPanel value={tabValue} index={0}>
          {upcomingBookings.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingBookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <BookingCard 
                    booking={booking} 
                    onCancel={handleCancelBooking} 
                    navigate={navigate}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              You don't have any upcoming bookings.
            </Typography>
          )}
        </TabPanel>

        {/* Past Bookings Tab */}
        <TabPanel value={tabValue} index={1}>
          {pastBookings.length > 0 ? (
            <Grid container spacing={3}>
              {pastBookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <BookingCard 
                    booking={booking} 
                    onCancel={handleCancelBooking} 
                    navigate={navigate}
                    isPast
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              You don't have any past bookings.
            </Typography>
          )}
        </TabPanel>

        {/* All Bookings Tab */}
        <TabPanel value={tabValue} index={2}>
          {bookings.length > 0 ? (
            <Grid container spacing={3}>
              {bookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <BookingCard 
                    booking={booking} 
                    onCancel={handleCancelBooking} 
                    navigate={navigate}
                    isPast={new Date(booking.date) < new Date()}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              You don't have any bookings yet.
            </Typography>
          )}
        </TabPanel>
      </Paper>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Looking for more adventures?
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/tours')}
          sx={{ mt: 1 }}
        >
          Explore Tours
        </Button>
      </Box>
    </Box>
  );
};

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  navigate: (path: string) => void;
  isPast?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, navigate, isPast = false }) => {
  const tourData = typeof booking.tour === 'string' 
    ? { name: 'Tour', type: 'walking', _id: booking.tour } 
    : booking.tour;
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {tourData.name}
          </Typography>
          <Chip
            label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            color={getStatusColor(booking.status) as any}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {new Date(booking.date).toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ConfirmationNumberIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Ticket Code: {booking.ticketCode}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total Amount:
          </Typography>
          <Typography variant="h6" color="primary">
            {booking.totalAmount} {typeof booking.tour !== 'string' ? booking.tour.currency : 'USD'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/tours/${tourData._id}/details`)}
        >
          View Tour
        </Button>
        <Button 
          size="small" 
          onClick={() => navigate(`/bookings/${booking._id}`)}
        >
          Booking Details
        </Button>
        {!isPast && booking.status !== 'cancelled' && (
          <Button 
            size="small" 
            color="error" 
            onClick={() => onCancel(booking._id)}
          >
            Cancel
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default BookingsPage;
