import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FavoriteService from '../../services/favorite.service';
import { useAnalytics } from '../../context/AnalyticsContext';

interface FavoriteButtonProps {
  tourId: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  tourId,
  size = 'medium',
  color = '#f50057',
  tooltipPlacement = 'top',
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { trackFeatureUsage } = useAnalytics();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && tourId) {
        try {
          setLoading(true);
          const status = await FavoriteService.checkTourInFavorites(tourId);
          setIsFavorite(status);
        } catch (err) {
          console.error('Error checking favorite status:', err);
          setError('Failed to check favorite status');
        } finally {
          setLoading(false);
        }
      }
    };

    checkFavoriteStatus();
  }, [tourId, isAuthenticated]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setLoading(true);
      
      if (isFavorite) {
        await FavoriteService.removeTourFromFavorites(tourId);
        trackFeatureUsage('Favorites', 'Remove', { tourId });
      } else {
        await FavoriteService.addTourToFavorites(tourId);
        trackFeatureUsage('Favorites', 'Add', { tourId });
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const tooltipTitle = isFavorite 
    ? 'Remove from favorites' 
    : isAuthenticated 
      ? 'Add to favorites' 
      : 'Sign in to add to favorites';

  return (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement}>
      <IconButton
        onClick={handleToggleFavorite}
        disabled={loading}
        size={size}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        sx={{
          color: isFavorite ? color : 'rgba(0, 0, 0, 0.54)',
          '&:hover': {
            color: color,
          },
        }}
      >
        {loading ? (
          <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 28 : 24} color="inherit" />
        ) : isFavorite ? (
          <FavoriteIcon fontSize={size} />
        ) : (
          <FavoriteBorderIcon fontSize={size} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton;
