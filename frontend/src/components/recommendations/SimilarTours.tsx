import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  useMediaQuery, 
  useTheme,
  Skeleton,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import RecommendationService, { Recommendation } from '../../services/recommendation.service';
import TourCard from '../tours/TourCard';
import MobileTourCard from '../tours/MobileTourCard';
import { useAnalytics } from '../../context/AnalyticsContext';

interface SimilarToursProps {
  tourId: string;
  limit?: number;
}

/**
 * Component to display similar tours to the current tour
 */
const SimilarTours: React.FC<SimilarToursProps> = ({
  tourId,
  limit = 4
}) => {
  const [similarTours, setSimilarTours] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { trackFeatureUsage } = useAnalytics();

  useEffect(() => {
    const fetchSimilarTours = async () => {
      if (!tourId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await RecommendationService.getSimilarTours(tourId, limit);
        
        if (response.status === 'success') {
          setSimilarTours(response.data.tours);
          trackFeatureUsage('Recommendations', 'View Similar Tours', { tourId });
        } else {
          setError(t('errors.similarToursFailed', 'Failed to load similar tours'));
        }
      } catch (err) {
        console.error('Error fetching similar tours:', err);
        setError(t('errors.similarToursFailed', 'Failed to load similar tours'));
        trackFeatureUsage('Recommendations', 'Error Similar Tours', { tourId });
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarTours();
  }, [tourId, limit, t, trackFeatureUsage]);

  // If no similar tours and not loading, don't render anything
  if (!loading && similarTours.length === 0 && !error) {
    return null;
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(limit).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
        <Box sx={{ width: '100%', height: isMobile ? 350 : 400 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="80%" height={30} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={20} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Skeleton variant="rectangular" width="45%" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="45%" height={40} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Grid>
    ));
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
        {t('tours.similarTours', 'Similar Tours')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : similarTours.length > 0 ? (
          similarTours.map((tour) => (
            <Grid item xs={12} sm={6} md={3} key={tour._id}>
              {isMobile ? (
                <MobileTourCard tour={tour} />
              ) : (
                <TourCard tour={tour} />
              )}
            </Grid>
          ))
        ) : null}
      </Grid>
    </Box>
  );
};

export default SimilarTours;
