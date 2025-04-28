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
  IconButton,
  Avatar,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon,
  Map as MapIcon,
  Restaurant as RestaurantIcon,
  Hotel as HotelIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsBike as DirectionsBikeIcon,
  Train as TrainIcon,
  Flight as FlightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import ShareButton from '../components/sharing/ShareButton';
import ItineraryService, { Itinerary } from '../services/itinerary.service';
import { useAuth } from '../context/AuthContext';
import ItineraryMap from '../components/maps/ItineraryMap';

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
      id={`itinerary-tabpanel-${index}`}
      aria-labelledby={`itinerary-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchItineraryData = async () => {
      try {
        setLoading(true);
        if (id) {
          const itineraryData = await ItineraryService.getItineraryById(id);
          setItinerary(itineraryData);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load itinerary details');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraryData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/itineraries/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await ItineraryService.deleteItinerary(id!);
        navigate('/itineraries');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete itinerary');
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tour':
        return <DirectionsWalkIcon />;
      case 'restaurant':
        return <RestaurantIcon />;
      case 'hotel':
        return <HotelIcon />;
      case 'transport':
        if (type === 'flight') return <FlightIcon />;
        if (type === 'train') return <TrainIcon />;
        if (type === 'bus') return <DirectionsBusIcon />;
        return <DirectionsBikeIcon />;
      default:
        return <LocationOnIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!itinerary) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">Itinerary not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/itineraries')}
          sx={{ mt: 2 }}
        >
          Back to Itineraries
        </Button>
      </Box>
    );
  }

  const isOwner = user && itinerary.user && user._id === itinerary.user._id;

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

      {/* Itinerary Header */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', p: 4, width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                  {itinerary.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ShareButton 
                    title={itinerary.name}
                    description={itinerary.description || `Itinerary from ${formatDate(itinerary.startDate)} to ${formatDate(itinerary.endDate)}`}
                    variant="icon"
                    size="large"
                    color="primary"
                  />
                  {isOwner && (
                    <>
                      <IconButton color="primary" onClick={handleEdit}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={handleDelete}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`}
                  color="primary"
                />
                <Chip
                  icon={itinerary.isPublic ? <PublicIcon /> : <LockIcon />}
                  label={itinerary.isPublic ? 'Public' : 'Private'}
                  color={itinerary.isPublic ? 'success' : 'default'}
                />
              </Box>
              {itinerary.user && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    {itinerary.user.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Created by {itinerary.user.username}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => setTabValue(1)}
                >
                  View Map
                </Button>
                <ShareButton 
                  title={itinerary.name}
                  description={itinerary.description || `Itinerary from ${formatDate(itinerary.startDate)} to ${formatDate(itinerary.endDate)}`}
                  variant="contained"
                  size="medium"
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Itinerary Details Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="itinerary details tabs">
            <Tab label="Schedule" id="itinerary-tab-0" />
            <Tab label="Map" id="itinerary-tab-1" />
            <Tab label="Details" id="itinerary-tab-2" />
          </Tabs>
        </Box>

        {/* Schedule Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Itinerary Schedule
          </Typography>
          {itinerary.description && (
            <Typography variant="body1" paragraph>
              {itinerary.description}
            </Typography>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {itinerary.days && itinerary.days.length > 0 ? (
            itinerary.days.map((day, dayIndex) => (
              <Box key={dayIndex} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Day {dayIndex + 1}: {formatDate(day.date)}
                </Typography>
                
                {day.activities && day.activities.length > 0 ? (
                  <List>
                    {day.activities.map((activity, activityIndex) => (
                      <ListItem
                        key={activityIndex}
                        alignItems="flex-start"
                        sx={{ 
                          pl: 0,
                          py: 2,
                          borderLeft: activityIndex < day.activities.length - 1 ? '2px solid' : 'none',
                          borderColor: 'divider',
                          ml: 2
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1" component="span">
                                {activity.title}
                              </Typography>
                              {activity.startTime && (
                                <Chip
                                  size="small"
                                  label={`${activity.startTime}${activity.endTime ? ` - ${activity.endTime}` : ''}`}
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              {activity.description && (
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {activity.description}
                                </Typography>
                              )}
                              {activity.location && activity.location.address && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5, mt: 0.3, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {activity.location.address}
                                  </Typography>
                                </Box>
                              )}
                              {activity.cost > 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  Cost: {activity.cost} {activity.currency || 'USD'}
                                </Typography>
                              )}
                              {activity.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  Note: {activity.notes}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No activities planned for this day.
                  </Typography>
                )}
                
                {day.notes && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Day notes: {day.notes}
                    </Typography>
                  </Box>
                )}
                
                {dayIndex < itinerary.days.length - 1 && <Divider sx={{ my: 3 }} />}
              </Box>
            ))
          ) : (
            <Typography variant="body1">
              No days have been added to this itinerary yet.
            </Typography>
          )}
        </TabPanel>

        {/* Map Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Itinerary Map
          </Typography>
          <Typography variant="body1" paragraph>
            View all the locations in your itinerary on the map below.
          </Typography>
          <ItineraryMap itinerary={itinerary} height={500} />
        </TabPanel>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                About This Itinerary
              </Typography>
              <Typography variant="body1" paragraph>
                {itinerary.description || 'No description available for this itinerary.'}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Itinerary Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Duration
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {itinerary.days?.length || 0} days
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        From {formatDate(itinerary.startDate)} to {formatDate(itinerary.endDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Activities
                      </Typography>
                      <Typography variant="body1">
                        {itinerary.days?.reduce((total, day) => total + (day.activities?.length || 0), 0) || 0} total activities
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Including tours, restaurants, hotels, and transportation
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sharing Options
                </Typography>
                <Typography variant="body2" paragraph>
                  This itinerary is currently {itinerary.isPublic ? 'public' : 'private'}.
                </Typography>
                <ShareButton 
                  title={itinerary.name}
                  description={itinerary.description || `Itinerary from ${formatDate(itinerary.startDate)} to ${formatDate(itinerary.endDate)}`}
                  variant="contained"
                  size="large"
                  color="primary"
                  url={window.location.href}
                />
              </Paper>

              {isOwner && (
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Itinerary Management
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={handleEdit}
                    sx={{ mb: 2 }}
                  >
                    Edit Itinerary
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    fullWidth
                    onClick={handleDelete}
                  >
                    Delete Itinerary
                  </Button>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ItineraryDetailPage;
