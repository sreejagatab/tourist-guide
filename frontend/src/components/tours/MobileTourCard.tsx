import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Rating,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsBike as DirectionsBikeIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import FavoriteButton from '../favorites/FavoriteButton';
import OfflineButton from '../offline/OfflineButton';
import ScreenReaderOnly from '../accessibility/ScreenReaderOnly';
import { Tour } from '../../services/tour.service';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useTranslation } from 'react-i18next';

interface MobileTourCardProps {
  tour: Tour;
}

const MobileTourCard: React.FC<MobileTourCardProps> = ({ tour }) => {
  const { trackFeatureUsage } = useAnalytics();
  const { t } = useTranslation();

  // Get icon based on tour type
  const getTourIcon = (type: string) => {
    switch (type) {
      case 'walking':
        return <DirectionsWalkIcon fontSize="small" />;
      case 'bus':
        return <DirectionsBusIcon fontSize="small" />;
      case 'bike':
        return <DirectionsBikeIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const handleViewDetails = () => {
    trackFeatureUsage('Tour', 'View Details Mobile', { tourId: tour._id });
  };

  const handleBookNow = () => {
    trackFeatureUsage('Tour', 'Book Now Mobile', { tourId: tour._id });
  };

  // Format duration for screen readers
  const formatDurationForScreenReader = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  // Get tour type label with proper capitalization
  const getTourTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Generate a unique ID for this card for aria-labelledby
  const cardId = `tour-card-${tour._id}`;
  const titleId = `tour-title-${tour._id}`;
  const detailsId = `tour-details-${tour._id}`;

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        mb: 2,
        // Optimize for touch
        '& .MuiButtonBase-root': {
          minHeight: '48px',
          minWidth: '48px',
        }
      }}
      aria-labelledby={`${titleId} ${detailsId}`}
      id={cardId}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://source.unsplash.com/random?landmarks'}
          alt={`${tour.name} - ${t('tours.tourImage')}`}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            gap: 0.5
          }}
        >
          <Tooltip title={`${getTourTypeLabel(tour.type)} ${t('tours.type.tour')}`}>
            <Chip
              icon={getTourIcon(tour.type)}
              label={getTourTypeLabel(tour.type)}
              size="small"
              color={
                tour.type === 'walking'
                  ? 'primary'
                  : tour.type === 'bus'
                  ? 'secondary'
                  : 'success'
              }
              sx={{
                height: '28px',
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.7rem',
                }
              }}
              aria-label={`${getTourTypeLabel(tour.type)} ${t('tours.type.tour')}`}
            />
          </Tooltip>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            zIndex: 1
          }}
        >
          <FavoriteButton tourId={tour._id} size="small" />
          <OfflineButton tourId={tour._id} size="small" />
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" component="h2" noWrap id={titleId}>
          {tour.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <LocationOnIcon
            fontSize="small"
            sx={{ color: 'text.secondary', mr: 0.5 }}
            aria-hidden="true"
          />
          <Typography variant="body2" color="text.secondary" noWrap>
            {tour.startLocation?.address || t('tours.locationNotSpecified')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }} id={detailsId}>
          <AccessTimeIcon
            fontSize="small"
            sx={{ color: 'text.secondary', mr: 0.5 }}
            aria-hidden="true"
          />
          <Typography variant="body2" color="text.secondary">
            {Math.floor(tour.duration / 60) > 0
              ? `${Math.floor(tour.duration / 60)}h ${tour.duration % 60}min`
              : `${tour.duration}min`}
          </Typography>
          <ScreenReaderOnly>
            {t('tours.duration')}: {formatDurationForScreenReader(tour.duration)}
          </ScreenReaderOnly>
          <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }} aria-hidden="true">
            •
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tour.distance} km
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating
              value={tour.ratingsAverage}
              precision={0.1}
              readOnly
              size="small"
              aria-label={`${t('reviews.rating')}: ${tour.ratingsAverage} ${t('reviews.outOf5')}`}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              ({tour.ratingsQuantity})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon
              fontSize="small"
              sx={{ color: 'primary.main' }}
              aria-hidden="true"
            />
            <Typography variant="h6" component="span" color="primary.main">
              {tour.price}
            </Typography>
            <ScreenReaderOnly>
              {t('tours.price')}: ${tour.price} {t('tours.perPerson')}
            </ScreenReaderOnly>
          </Box>
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
        <Button
          size="medium"
          component={RouterLink}
          to={`/tours/${tour._id}/details`}
          onClick={handleViewDetails}
          sx={{
            flex: 1,
            mr: 1,
            height: '48px',
            borderRadius: '8px'
          }}
          aria-label={`${t('tours.viewDetails')} ${t('common.for')} ${tour.name}`}
        >
          {t('tours.viewDetails')}
        </Button>
        <Button
          size="medium"
          variant="contained"
          component={RouterLink}
          to={`/tours/${tour._id}/book`}
          onClick={handleBookNow}
          sx={{
            flex: 1,
            height: '48px',
            borderRadius: '8px'
          }}
          aria-label={`${t('tours.bookNow')} ${t('common.for')} ${tour.name}`}
        >
          {t('tours.bookNow')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default MobileTourCard;
