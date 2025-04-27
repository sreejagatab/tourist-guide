import React, { useMemo } from 'react';
import GoogleMapComponent from './GoogleMap';
import { Itinerary } from '../../services/itinerary.service';

interface ItineraryMapProps {
  itinerary: Itinerary;
  height?: string | number;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ itinerary, height = 400 }) => {
  // Convert itinerary activities to map locations
  const mapLocations = useMemo(() => {
    const locations = [];
    
    if (itinerary.days && itinerary.days.length > 0) {
      itinerary.days.forEach((day, dayIndex) => {
        if (day.activities && day.activities.length > 0) {
          day.activities.forEach((activity, activityIndex) => {
            if (activity.location && activity.location.coordinates) {
              locations.push({
                id: `day-${dayIndex}-activity-${activityIndex}`,
                position: {
                  lat: activity.location.coordinates[1],
                  lng: activity.location.coordinates[0]
                },
                title: activity.title,
                description: `${activity.description || ''} 
                  ${activity.startTime ? `Start: ${activity.startTime}` : ''} 
                  ${activity.endTime ? `End: ${activity.endTime}` : ''}`
              });
            }
          });
        }
      });
    }
    
    return locations;
  }, [itinerary]);
  
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
      zoom={12}
      locations={mapLocations}
      height={height}
    />
  );
};

export default ItineraryMap;
