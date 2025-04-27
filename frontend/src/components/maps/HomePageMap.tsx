import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import GoogleMapComponent from './GoogleMap';
import TourService, { Tour } from '../../services/tour.service';

interface HomePageMapProps {
  height?: string | number;
}

const HomePageMap: React.FC<HomePageMapProps> = ({ height = 500 }) => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        // Get top rated tours
        const response = await TourService.getAllTours({ 
          sort: '-ratingsAverage', 
          limit: 10 
        });
        setTours(response.tours);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Convert tours to map locations
  const mapLocations = tours
    .filter(tour => 
      tour.startLocation && 
      tour.startLocation.coordinates && 
      tour.startLocation.coordinates.length === 2
    )
    .map(tour => ({
      id: tour._id,
      position: {
        lat: tour.startLocation.coordinates[1],
        lng: tour.startLocation.coordinates[0]
      },
      title: tour.name,
      description: `${tour.type.charAt(0).toUpperCase() + tour.type.slice(1)} Tour • ${tour.price} ${tour.currency}`
    }));

  // Default center (New York City)
  const defaultCenter = { lat: 40.7128, lng: -74.0060 };
  
  // Use the first tour location as center if available
  const center = mapLocations.length > 0 ? mapLocations[0].position : defaultCenter;

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading tour locations...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading map
          </Typography>
          <Typography variant="body2" paragraph>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  if (mapLocations.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No tour locations available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      <GoogleMapComponent
        center={center}
        zoom={3} // Zoomed out to show multiple locations
        locations={mapLocations}
        height={height}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1,
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          maxWidth: 300,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Explore Our Top Tours
        </Typography>
        <Typography variant="body2">
          Click on the markers to see our most popular tours around the world.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePageMap;
