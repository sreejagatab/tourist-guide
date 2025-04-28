import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Grid, 
  useMediaQuery, 
  useTheme,
  Button,
  Skeleton,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import RecommendationService, { Recommendation } from '../../services/recommendation.service';
import TourCard from '../tours/TourCard';
import MobileTourCard from '../tours/MobileTourCard';
import { Link as RouterLink } from 'react-router-dom';
import { useAnalytics } from '../../context/AnalyticsContext';

interface PersonalizedRecommendationsProps {
  limit?: number;
  showTitle?: boolean;
  showViewAll?: boolean;
}

/**
 * Component to display personalized tour recommendations
 */
const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  limit = 4,
  showTitle = true,
  showViewAll = true
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { trackFeatureUsage } = useAnalytics();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If user is logged in, get personalized recommendations
        if (user) {
          const response = await RecommendationService.getPersonalizedRecommendations(limit);
          
          if (response.status === 'success' && response.data.recommendations.length > 0) {
            setRecommendations(response.data.recommendations);
            trackFeatureUsage('Recommendations', 'View Personalized');
          } else {
            // Fallback to popular tours if no personalized recommendations
            const popularResponse = await RecommendationService.getPopularTours(limit);
            setRecommendations(popularResponse.data.tours);
            trackFeatureUsage('Recommendations', 'View Popular Fallback');
          }
        } else {
          // Get popular tours for non-authenticated users
          const response = await RecommendationService.getPopularTours(limit);
          setRecommendations(response.data.tours);
          trackFeatureUsage('Recommendations', 'View Popular');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(t('errors.recommendationsFailed', 'Failed to load recommendations'));
        trackFeatureUsage('Recommendations', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, limit, t, trackFeatureUsage]);

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
    <Box sx={{ mt: 4, mb: 6 }}>
      {showTitle && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            {user 
              ? t('recommendations.personalizedForYou', 'Recommended for You')
              : t('recommendations.popularTours', 'Popular Tours')}
          </Typography>
          
          {showViewAll && (
            <Button 
              component={RouterLink} 
              to="/tours" 
              color="primary"
              onClick={() => trackFeatureUsage('Recommendations', 'View All')}
            >
              {t('common.viewAll', 'View All')}
            </Button>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : recommendations.length > 0 ? (
          recommendations.map((tour) => (
            <Grid item xs={12} sm={6} md={3} key={tour._id}>
              {isMobile ? (
                <MobileTourCard tour={tour} />
              ) : (
                <TourCard tour={tour} />
              )}
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('recommendations.noRecommendations', 'No recommendations available at the moment.')}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/tours" 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => trackFeatureUsage('Recommendations', 'Explore Tours')}
              >
                {t('recommendations.exploreTours', 'Explore All Tours')}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PersonalizedRecommendations;
