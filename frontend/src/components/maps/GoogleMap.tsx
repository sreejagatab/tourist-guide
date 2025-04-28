import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

// Replace with your actual Google Maps API key
// Using a temporary key for development
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface MapLocation {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
}

interface GoogleMapComponentProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  locations?: MapLocation[];
  height?: string | number;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  zoom = 12,
  locations = [],
  height = 400
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
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
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2">Loading map...</Typography>
        </Box>
      </Box>
    );
  }

  // If API key is missing, show a placeholder
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 1,
          p: 2,
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Map Unavailable
          </Typography>
          <Typography variant="body2">
            Google Maps API key is required to display the map.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            title={location.title}
            onClick={() => setSelectedLocation(location)}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <Paper sx={{ p: 1, maxWidth: 200 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedLocation.title}
              </Typography>
              {selectedLocation.description && (
                <Typography variant="body2">
                  {selectedLocation.description}
                </Typography>
              )}
            </Paper>
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
};

export default GoogleMapComponent;
