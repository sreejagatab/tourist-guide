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

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
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
    trackFeatureUsage('Tour', 'View Details Desktop', { tourId: tour._id });
  };

  const handleBookNow = () => {
    trackFeatureUsage('Tour', 'Book Now Desktop', { tourId: tour._id });
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        }
      }}
      aria-labelledby={`${titleId} ${detailsId}`}
      id={cardId}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://source.unsplash.com/random?landmarks'}
          alt={`${tour.name} - ${t('tours.tourImage')}`}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
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
                height: '32px',
                '& .MuiChip-label': {
                  px: 1.5,
                  fontSize: '0.8rem',
                  fontWeight: 500
                }
              }}
              aria-label={`${getTourTypeLabel(tour.type)} ${t('tours.type.tour')}`}
            />
          </Tooltip>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 0.5,
            zIndex: 1
          }}
        >
          <FavoriteButton tourId={tour._id} size="medium" />
          <OfflineButton tourId={tour._id} size="medium" />
        </Box>
      </Box>

      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom id={titleId} sx={{ fontWeight: 'bold' }}>
          {tour.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LocationOnIcon
            fontSize="small"
            sx={{ color: 'text.secondary', mr: 0.5 }}
            aria-hidden="true"
          />
          <Typography variant="body2" color="text.secondary">
            {tour.startLocation?.address || t('tours.locationNotSpecified')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }} id={detailsId}>
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tour.summary || tour.description?.substring(0, 120) + '...'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
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
            <Typography variant="h6" component="span" color="primary.main" fontWeight="bold">
              {tour.price}
            </Typography>
            <ScreenReaderOnly>
              {t('tours.price')}: ${tour.price} {t('tours.perPerson')}
            </ScreenReaderOnly>
          </Box>
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          size="medium"
          component={RouterLink}
          to={`/tours/${tour._id}/details`}
          onClick={handleViewDetails}
          sx={{ flex: 1, mr: 1 }}
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
          sx={{ flex: 1 }}
          aria-label={`${t('tours.bookNow')} ${t('common.for')} ${tour.name}`}
        >
          {t('tours.bookNow')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default TourCard;
