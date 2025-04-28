import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Container,
  Paper,
  Divider,
} from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import ExploreIcon from '@mui/icons-material/Explore';
import HomePageMap from '../components/maps/HomePageMap';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('https://source.unsplash.com/random?travel')`,
          height: '500px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Increase the priority of the hero background image */}
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
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography component="h1" variant="h2" color="inherit" gutterBottom>
            Discover the World with TourGuide
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Explore amazing destinations with our guided tours. Experience local culture, history, and
            attractions with our expert guides.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/tours"
            sx={{ mt: 2 }}
          >
            Explore Tours
          </Button>
        </Container>
      </Paper>

      {/* Tour Types Section */}
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Explore Our Tour Types
      </Typography>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image="https://source.unsplash.com/random?walking+tour"
              alt="Walking Tour"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsWalkIcon sx={{ mr: 1 }} />
                <Typography gutterBottom variant="h5" component="h2">
                  Walking Tours
                </Typography>
              </Box>
              <Typography>
                Explore cities on foot with our expert guides. Discover hidden gems, historical sites, and
                local culture at a leisurely pace.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/tours/walking">
                View Walking Tours
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image="https://source.unsplash.com/random?bus+tour"
              alt="Bus Tour"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsBusIcon sx={{ mr: 1 }} />
                <Typography gutterBottom variant="h5" component="h2">
                  Bus Tours
                </Typography>
              </Box>
              <Typography>
                Cover more ground with our comfortable bus tours. Hop on and off at key attractions with
                informative commentary along the way.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/tours/bus">
                View Bus Tours
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image="https://source.unsplash.com/random?bike+tour"
              alt="Bike Tour"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsBikeIcon sx={{ mr: 1 }} />
                <Typography gutterBottom variant="h5" component="h2">
                  Bike Tours
                </Typography>
              </Box>
              <Typography>
                Experience the freedom of exploring on two wheels. Our bike tours offer a fun and
                eco-friendly way to see the sights.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/tours/bike">
                View Bike Tours
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Map Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 2 }}>
          Explore Tours Around the World
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          Discover our top-rated tours in destinations worldwide. Click on the map markers to learn more.
        </Typography>
        <Box sx={{ height: 500, mb: 3 }}>
          <HomePageMap />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<ExploreIcon />}
            component={RouterLink}
            to="/tours"
            size="large"
          >
            Find Tours Near You
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Personalized Recommendations Section */}
      <Container maxWidth="lg">
        <PersonalizedRecommendations limit={4} />
      </Container>

      <Divider sx={{ my: 6 }} />

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6, px: 2, borderRadius: 2, mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Why Choose TourGuide?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="https://via.placeholder.com/100"
                alt="Expert Guides"
                style={{ width: 80, height: 80, marginBottom: 16 }}
              />
              <Typography variant="h6" gutterBottom>
                Expert Guides
              </Typography>
              <Typography variant="body2">
                Our knowledgeable guides provide insightful commentary and local expertise.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="https://via.placeholder.com/100"
                alt="Flexible Booking"
                style={{ width: 80, height: 80, marginBottom: 16 }}
              />
              <Typography variant="h6" gutterBottom>
                Flexible Booking
              </Typography>
              <Typography variant="body2">
                Easy cancellation, rescheduling, and group booking options available.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="https://via.placeholder.com/100"
                alt="Custom Itineraries"
                style={{ width: 80, height: 80, marginBottom: 16 }}
              />
              <Typography variant="h6" gutterBottom>
                Custom Itineraries
              </Typography>
              <Typography variant="body2">
                Create personalized travel plans tailored to your interests and schedule.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="https://via.placeholder.com/100"
                alt="Mobile App"
                style={{ width: 80, height: 80, marginBottom: 16 }}
              />
              <Typography variant="h6" gutterBottom>
                Mobile App
              </Typography>
              <Typography variant="body2">
                Access your bookings, maps, and audio guides on the go with our app.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Start Exploring?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
          Join thousands of satisfied travelers who have discovered new destinations with TourGuide.
          Book your next adventure today!
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/register"
          sx={{ mr: 2 }}
        >
          Sign Up Now
        </Button>
        <Button variant="outlined" size="large" component={RouterLink} to="/tours">
          Browse Tours
        </Button>
      </Box>
    </>
  );
};

export default HomePage;
