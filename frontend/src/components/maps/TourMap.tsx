import React, { useMemo } from 'react';
import GoogleMapComponent from './GoogleMap';
import { Tour } from '../../services/tour.service';

interface TourMapProps {
  tour: Tour;
  height?: string | number;
}

const TourMap: React.FC<TourMapProps> = ({ tour, height = 400 }) => {
  // Convert tour locations to map locations
  const mapLocations = useMemo(() => {
    const locations = [];
    
    // Add start location
    if (tour.startLocation && tour.startLocation.coordinates) {
      locations.push({
        id: 'start',
        position: {
          lat: tour.startLocation.coordinates[1],
          lng: tour.startLocation.coordinates[0]
        },
        title: 'Start: ' + (tour.startLocation.description || tour.name),
        description: tour.startLocation.address
      });
    }
    
    // Add tour locations
    if (tour.locations && tour.locations.length > 0) {
      tour.locations.forEach((location, index) => {
        if (location.coordinates) {
          locations.push({
            id: `location-${index}`,
            position: {
              lat: location.coordinates[1],
              lng: location.coordinates[0]
            },
            title: location.description || `Stop ${index + 1}`,
            description: location.address
          });
        }
      });
    }
    
    // Add bus stops if applicable
    if (tour.type === 'bus' && tour.busStops && tour.busStops.length > 0) {
      tour.busStops.forEach((stop, index) => {
        if (stop.location && stop.location.coordinates) {
          locations.push({
            id: `bus-stop-${index}`,
            position: {
              lat: stop.location.coordinates[1],
              lng: stop.location.coordinates[0]
            },
            title: `Bus Stop ${index + 1}`,
            description: `${stop.location.address || ''} 
              ${stop.arrivalTime ? `Arrival: ${stop.arrivalTime}` : ''} 
              ${stop.departureTime ? `Departure: ${stop.departureTime}` : ''}`
          });
        }
      });
    }
    
    return locations;
  }, [tour]);
  
  // Determine center of map (default to first location)
  const center = useMemo(() => {
    if (mapLocations.length > 0) {
      return mapLocations[0].position;
    }
    
    // Default to a central location if no coordinates are available
    return { lat: 40.7128, lng: -74.0060 }; // New York City
  }, [mapLocations]);
  
  return (
    <GoogleMapComponent
      center={center}
      zoom={tour.type === 'bus' ? 10 : 14} // Zoom out more for bus tours
      locations={mapLocations}
      height={height}
    />
  );
};

export default TourMap;
