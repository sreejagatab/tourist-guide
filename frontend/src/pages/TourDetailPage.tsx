import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Rating,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsBike as DirectionsBikeIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Map as MapIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import TourService, { Tour } from '../services/tour.service';
import ReviewService, { Review } from '../services/review.service';
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
      id={`tour-tabpanel-${index}`}
      aria-labelledby={`tour-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        if (id) {
          const tourData = await TourService.getTourById(id);
          setTour(tourData);
          
          // Fetch reviews
          const reviewsData = await ReviewService.getTourReviews(id);
          setReviews(reviewsData);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/tours/${id}` } });
    } else {
      navigate(`/tours/${id}/book`);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'difficult':
        return 'error';
      default:
        return 'default';
    }
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
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!tour) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">Tour not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
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
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Tour Header */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('${tour.images && tour.images.length > 0 ? tour.images[0] : 'https://source.unsplash.com/random?travel'}')`,
          height: '400px',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box sx={{ position: 'relative', p: 4, width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                {tour.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Chip
                  icon={getTourIcon(tour.type)}
                  label={tour.type.charAt(0).toUpperCase() + tour.type.slice(1)}
                  color={
                    tour.type === 'walking'
                      ? 'primary'
                      : tour.type === 'bus'
                      ? 'secondary'
                      : 'success'
                  }
                />
                <Chip
                  label={tour.difficulty}
                  color={getDifficultyColor(tour.difficulty) as any}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Rating value={tour.ratingsAverage} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    ({tour.ratingsQuantity})
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" color="inherit">
                {tour.startLocation.address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h4" color="inherit" gutterBottom>
                {tour.price} {tour.currency}
              </Typography>
              <Typography variant="subtitle1" color="inherit" gutterBottom>
                per person
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleBookNow}
                sx={{ mt: 1 }}
              >
                Book Now
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tour Details Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tour details tabs">
            <Tab label="Overview" id="tour-tab-0" />
            <Tab label="Itinerary" id="tour-tab-1" />
            <Tab label="Reviews" id="tour-tab-2" />
            <Tab label="Map" id="tour-tab-3" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                About This Tour
              </Typography>
              <Typography variant="body1" paragraph>
                {tour.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h5" gutterBottom>
                Tour Highlights
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Duration</Typography>
                      </Box>
                      <Typography variant="body2">
                        {Math.floor(tour.duration / 60) > 0
                          ? `${Math.floor(tour.duration / 60)}h ${tour.duration % 60}min`
                          : `${tour.duration}min`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Distance</Typography>
                      </Box>
                      <Typography variant="body2">{tour.distance} km</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GroupIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Group Size</Typography>
                      </Box>
                      <Typography variant="body2">Max {tour.maxGroupSize} people</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tour Type Specific Features */}
              {tour.type === 'walking' && tour.audioGuide && (
                <>
                  <Typography variant="h5" gutterBottom>
                    Audio Guide
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {tour.audioGuide.available
                      ? `Audio guide available in ${tour.audioGuide.languages?.join(', ')}`
                      : 'Audio guide not available for this tour'}
                  </Typography>
                </>
              )}

              {tour.type === 'bike' && tour.bikeRental && (
                <>
                  <Typography variant="h5" gutterBottom>
                    Bike Rental
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {tour.bikeRental.available
                      ? `Bike rental available for ${tour.bikeRental.price} ${tour.currency}. Options: ${tour.bikeRental.options?.join(', ')}`
                      : 'Bike rental not available for this tour. Please bring your own bike.'}
                  </Typography>
                </>
              )}

              {tour.type === 'bus' && tour.busStops && tour.busStops.length > 0 && (
                <>
                  <Typography variant="h5" gutterBottom>
                    Bus Stops
                  </Typography>
                  <List>
                    {tour.busStops.map((stop, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={stop.location.address || `Stop ${index + 1}`}
                          secondary={`Arrival: ${stop.arrivalTime || 'N/A'} | Departure: ${stop.departureTime || 'N/A'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tour Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Duration"
                      secondary={
                        Math.floor(tour.duration / 60) > 0
                          ? `${Math.floor(tour.duration / 60)}h ${tour.duration % 60}min`
                          : `${tour.duration}min`
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Distance"
                      secondary={`${tour.distance} km`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Difficulty"
                      secondary={tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Group Size"
                      secondary={`Max ${tour.maxGroupSize} people`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoneyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Price"
                      secondary={`${tour.price} ${tour.currency} per person`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Rating"
                      secondary={`${tour.ratingsAverage} (${tour.ratingsQuantity} reviews)`}
                    />
                  </ListItem>
                </List>
              </Paper>

              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Meeting Point
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1, mt: 0.5 }} color="error" />
                  <Typography variant="body2">
                    {tour.startLocation.address || 'Address not specified'}
                    {tour.startLocation.description && (
                      <>
                        <br />
                        {tour.startLocation.description}
                      </>
                    )}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  fullWidth
                  onClick={() => setTabValue(3)}
                >
                  View on Map
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Itinerary Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Tour Itinerary
          </Typography>
          
          {tour.locations && tour.locations.length > 0 ? (
            <List>
              {tour.locations.map((location, index) => (
                <ListItem key={index} sx={{ mb: 2, display: 'block' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography variant="h6">
                        {location.description || `Stop ${index + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {location.address || 'Address not specified'}
                      </Typography>
                      {location.day !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          Day {location.day}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {index < tour.locations.length - 1 && (
                    <Box
                      sx={{
                        height: 30,
                        borderLeft: '2px dashed',
                        borderColor: 'primary.main',
                        ml: 5,
                        my: 1,
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1">
              Detailed itinerary not available for this tour.
            </Typography>
          )}
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Reviews ({reviews.length})
            </Typography>
            {user && (
              <Button
                variant="contained"
                onClick={() => navigate(`/tours/${id}/review`)}
              >
                Write a Review
              </Button>
            )}
          </Box>

          {reviews.length > 0 ? (
            <Grid container spacing={3}>
              {reviews.map((review) => (
                <Grid item xs={12} key={typeof review === 'string' ? review : review._id}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {typeof review !== 'string' && typeof review.user !== 'string' && (
                          <>
                            <Box
                              component="img"
                              src={review.user.profilePicture || 'https://via.placeholder.com/40'}
                              alt={review.user.username}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                mr: 2,
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle1">
                                {review.user.username}
                                {review.verifiedPurchase && (
                                  <Chip
                                    label="Verified Purchase"
                                    size="small"
                                    color="success"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                      <Box>
                        <Rating value={typeof review !== 'string' ? review.rating : 0} readOnly />
                      </Box>
                    </Box>
                    
                    {typeof review !== 'string' && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          {review.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {review.review}
                        </Typography>
                        
                        {review.photos && review.photos.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', py: 1 }}>
                            {review.photos.map((photo, index) => (
                              <Box
                                key={index}
                                component="img"
                                src={photo}
                                alt={`Review photo ${index + 1}`}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Button
                            size="small"
                            onClick={() => ReviewService.voteReviewHelpful(review._id)}
                          >
                            Helpful ({review.helpfulVotes})
                          </Button>
                          
                          {user && typeof review.user !== 'string' && user._id === review.user._id && (
                            <Box>
                              <Button
                                size="small"
                                onClick={() => navigate(`/reviews/${review._id}/edit`)}
                                sx={{ mr: 1 }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this review?')) {
                                    await ReviewService.deleteReview(review._id);
                                    setReviews(reviews.filter(r => typeof r !== 'string' && r._id !== review._id));
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
                        </Box>
                        
                        {review.response && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Response from {typeof review.response.user !== 'string' ? review.response.user.username : 'Tour Operator'}
                            </Typography>
                            <Typography variant="body2">
                              {review.response.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.response.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">
              No reviews yet. Be the first to review this tour!
            </Typography>
          )}
        </TabPanel>

        {/* Map Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Tour Map
          </Typography>
          <Typography variant="body1" paragraph>
            Map integration will be implemented in the next phase.
          </Typography>
          <Box
            sx={{
              height: 400,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Map Placeholder
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Related Tours */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Similar Tours
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          You might also be interested in these tours
        </Typography>
        <Typography variant="body1">
          Similar tours will be implemented in the next phase.
        </Typography>
      </Box>

      {/* Booking CTA */}
      <Paper sx={{ p: 3, textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Ready to Experience This Tour?
        </Typography>
        <Typography variant="body1" paragraph>
          Book now to secure your spot. Easy cancellation up to 24 hours before the tour.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleBookNow}
        >
          Book Now
        </Button>
      </Paper>
    </Box>
  );
};

export default TourDetailPage;
