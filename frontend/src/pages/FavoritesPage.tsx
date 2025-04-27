import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Rating,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsBike as DirectionsBikeIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FavoriteService from '../services/favorite.service';
import { Tour } from '../services/tour.service';
import { Itinerary } from '../services/itinerary.service';
import FavoriteButton from '../components/favorites/FavoriteButton';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';

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
      id={`favorites-tabpanel-${index}`}
      aria-labelledby={`favorites-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackFeatureUsage } = useAnalytics();
  const [tabValue, setTabValue] = useState(0);
  const [favoriteTours, setFavoriteTours] = useState<Tour[]>([]);
  const [favoriteItineraries, setFavoriteItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // Track page view
        trackFeatureUsage('Favorites', 'View Page');
        
        // Fetch favorite tours
        const tours = await FavoriteService.getFavoriteTours();
        setFavoriteTours(tours);
        
        // Fetch favorite itineraries
        const itineraries = await FavoriteService.getFavoriteItineraries();
        setFavoriteItineraries(itineraries);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [trackFeatureUsage]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewTour = (tourId: string) => {
    navigate(`/tours/${tourId}/details`);
  };

  const handleViewItinerary = (itineraryId: string) => {
    navigate(`/itineraries/${itineraryId}`);
  };

  const handleRemoveTour = async (tourId: string) => {
    try {
      await FavoriteService.removeTourFromFavorites(tourId);
      setFavoriteTours(favoriteTours.filter(tour => tour._id !== tourId));
      trackFeatureUsage('Favorites', 'Remove Tour', { tourId });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove tour from favorites');
    }
  };

  const handleRemoveItinerary = async (itineraryId: string) => {
    try {
      await FavoriteService.removeItineraryFromFavorites(itineraryId);
      setFavoriteItineraries(favoriteItineraries.filter(itinerary => itinerary._id !== itineraryId));
      trackFeatureUsage('Favorites', 'Remove Itinerary', { itineraryId });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove itinerary from favorites');
    }
  };

  const getTourTypeIcon = (type: string) => {
    switch (type) {
      case 'walking':
        return <DirectionsWalkIcon />;
      case 'bus':
        return <DirectionsBusIcon />;
      case 'bike':
        return <DirectionsBikeIcon />;
      default:
        return <DirectionsWalkIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Favorites
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Tours" id="favorites-tab-0" />
          <Tab label="Itineraries" id="favorites-tab-1" />
        </Tabs>
        <Divider />

        {/* Tours Tab */}
        <TabPanel value={tabValue} index={0}>
          {favoriteTours.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You haven't saved any tours yet
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/tours')}
                sx={{ mt: 2 }}
              >
                Explore Tours
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {favoriteTours.map((tour) => (
                <Grid item xs={12} sm={6} md={4} key={tour._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={tour.images && tour.images.length > 0 
                        ? tour.images[0] 
                        : 'https://source.unsplash.com/random?landmarks'}
                      alt={tour.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {tour.name}
                        </Typography>
                        <FavoriteButton tourId={tour._id} />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          icon={getTourTypeIcon(tour.type)} 
                          label={tour.type.charAt(0).toUpperCase() + tour.type.slice(1)} 
                          size="small" 
                          sx={{ mr: 1 }} 
                        />
                        <Chip 
                          label={tour.difficulty} 
                          size="small" 
                          color={
                            tour.difficulty === 'easy' ? 'success' : 
                            tour.difficulty === 'moderate' ? 'warning' : 
                            'error'
                          }
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={tour.ratingsAverage} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({tour.ratingsQuantity})
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tour.description.length > 100 
                          ? `${tour.description.substring(0, 100)}...` 
                          : tour.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {Math.floor(tour.duration / 60)} hours {tour.duration % 60 > 0 ? `${tour.duration % 60} min` : ''}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {tour.startLocation?.description || 'Various locations'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {tour.price} {tour.currency}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleViewTour(tour._id)}
                        sx={{ flexGrow: 1 }}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveTour(tour._id)}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Itineraries Tab */}
        <TabPanel value={tabValue} index={1}>
          {favoriteItineraries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You haven't saved any itineraries yet
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/itineraries')}
                sx={{ mt: 2 }}
              >
                Explore Itineraries
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {favoriteItineraries.map((itinerary) => (
                <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {itinerary.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {itinerary.description && itinerary.description.length > 100 
                          ? `${itinerary.description.substring(0, 100)}...` 
                          : itinerary.description || 'No description available'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.days?.length || 0} days
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleViewItinerary(itinerary._id)}
                        sx={{ flexGrow: 1 }}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveItinerary(itinerary._id)}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default FavoritesPage;
