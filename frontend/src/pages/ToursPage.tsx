import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Divider,
  Paper,
  SelectChangeEvent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FavoriteButton from '../components/favorites/FavoriteButton';
import OfflineButton from '../components/offline/OfflineButton';
import MobileTourCard from '../components/tours/MobileTourCard';
import MobileSearchBar from '../components/search/MobileSearchBar';
import useResponsive from '../hooks/useResponsive';
import TourService, { Tour } from '../services/tour.service';

// Mock data for tours
const mockTours = [
  {
    id: '1',
    name: 'Historic City Center Walking Tour',
    description: 'Explore the rich history of the city center with our expert guides.',
    type: 'walking',
    duration: 120,
    distance: 3.5,
    difficulty: 'easy',
    price: 25,
    currency: 'USD',
    ratingsAverage: 4.7,
    ratingsQuantity: 124,
    image: 'https://source.unsplash.com/random?city+walking+tour',
  },
  {
    id: '2',
    name: 'Hop-On Hop-Off City Bus Tour',
    description: 'See all the major attractions with our convenient bus tour.',
    type: 'bus',
    duration: 180,
    distance: 15,
    difficulty: 'easy',
    price: 35,
    currency: 'USD',
    ratingsAverage: 4.5,
    ratingsQuantity: 89,
    image: 'https://source.unsplash.com/random?bus+tour',
  },
  {
    id: '3',
    name: 'Scenic Waterfront Bike Tour',
    description: 'Cycle along the beautiful waterfront and enjoy stunning views.',
    type: 'bike',
    duration: 150,
    distance: 12,
    difficulty: 'moderate',
    price: 30,
    currency: 'USD',
    ratingsAverage: 4.8,
    ratingsQuantity: 56,
    image: 'https://source.unsplash.com/random?bike+tour',
  },
  {
    id: '4',
    name: 'Cultural District Walking Tour',
    description: 'Discover the art and culture of the city\'s vibrant cultural district.',
    type: 'walking',
    duration: 90,
    distance: 2.5,
    difficulty: 'easy',
    price: 20,
    currency: 'USD',
    ratingsAverage: 4.6,
    ratingsQuantity: 72,
    image: 'https://source.unsplash.com/random?cultural+tour',
  },
  {
    id: '5',
    name: 'Mountain Bike Adventure',
    description: 'Challenge yourself with this exciting mountain bike tour.',
    type: 'bike',
    duration: 240,
    distance: 25,
    difficulty: 'difficult',
    price: 45,
    currency: 'USD',
    ratingsAverage: 4.9,
    ratingsQuantity: 38,
    image: 'https://source.unsplash.com/random?mountain+bike',
  },
  {
    id: '6',
    name: 'Night Bus City Lights Tour',
    description: 'Experience the city\'s beautiful lights and nightlife.',
    type: 'bus',
    duration: 120,
    distance: 10,
    difficulty: 'easy',
    price: 40,
    currency: 'USD',
    ratingsAverage: 4.7,
    ratingsQuantity: 64,
    image: 'https://source.unsplash.com/random?night+city',
  },
];

const ToursPage: React.FC = () => {
  const { tourType } = useParams<{ tourType?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const { isMobile } = useResponsive();

  // Filter tours based on tour type and other filters
  const filteredTours = mockTours.filter((tour) => {
    // Filter by tour type if specified
    if (tourType && tour.type !== tourType) {
      return false;
    }

    // Filter by search term
    if (
      searchTerm &&
      !tour.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !tour.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        if (tour.price < min || tour.price > max) return false;
      } else {
        if (tour.price < min) return false;
      }
    }

    // Filter by difficulty
    if (difficulty !== 'all' && tour.difficulty !== difficulty) {
      return false;
    }

    return true;
  });

  // Sort tours
  const sortedTours = [...filteredTours].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'duration-low':
        return a.duration - b.duration;
      case 'duration-high':
        return b.duration - a.duration;
      case 'rating':
        return b.ratingsAverage - a.ratingsAverage;
      default:
        return 0; // recommended - no specific sort
    }
  });

  // Pagination
  const toursPerPage = 6;
  const totalPages = Math.ceil(sortedTours.length / toursPerPage);
  const displayedTours = sortedTours.slice((page - 1) * toursPerPage, page * toursPerPage);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handlePriceRangeChange = (event: SelectChangeEvent) => {
    setPriceRange(event.target.value);
    setPage(1);
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get title based on tour type
  const getTitle = () => {
    switch (tourType) {
      case 'walking':
        return 'Walking Tours';
      case 'bus':
        return 'Bus Tours';
      case 'bike':
        return 'Bike Tours';
      default:
        return 'All Tours';
    }
  };

  // Get icon based on tour type
  const getTourIcon = (type: string) => {
    switch (type) {
      case 'walking':
        return <DirectionsWalkIcon />;
      case 'bus':
        return <DirectionsBusIcon />;
      case 'bike':
        return <DirectionsBikeIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      {/* Filters and Search */}
      {isMobile ? (
        // Mobile search and filters
        <MobileSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
        />
      ) : (
        // Desktop search and filters
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Tours"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort-select"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  <MenuItem value="recommended">Recommended</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="duration-low">Duration: Short to Long</MenuItem>
                  <MenuItem value="duration-high">Duration: Long to Short</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="price-label">Price Range</InputLabel>
                <Select
                  labelId="price-label"
                  id="price-select"
                  value={priceRange}
                  label="Price Range"
                  onChange={handlePriceRangeChange}
                >
                  <MenuItem value="all">All Prices</MenuItem>
                  <MenuItem value="0-25">$0 - $25</MenuItem>
                  <MenuItem value="25-50">$25 - $50</MenuItem>
                  <MenuItem value="50-100">$50 - $100</MenuItem>
                  <MenuItem value="100">$100+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  id="difficulty-select"
                  value={difficulty}
                  label="Difficulty"
                  onChange={handleDifficultyChange}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="difficult">Difficult</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredTours.length} tours found
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tour Cards */}
      {displayedTours.length > 0 ? (
        isMobile ? (
          // Mobile view - stack cards vertically with mobile-optimized card
          <Box>
            {displayedTours.map((tour) => (
              <MobileTourCard
                key={tour.id}
                tour={{
                  ...tour,
                  _id: tour.id, // Ensure compatibility with MobileTourCard props
                  startLocation: { address: 'City Center' }, // Mock data
                }}
              />
            ))}
          </Box>
        ) : (
          // Desktop view - grid layout with standard cards
          <Grid container spacing={4}>
            {displayedTours.map((tour) => (
              <Grid item key={tour.id} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={tour.image}
                    alt={tour.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        icon={getTourIcon(tour.type)}
                        label={tour.type.charAt(0).toUpperCase() + tour.type.slice(1)}
                        size="small"
                        color={
                          tour.type === 'walking'
                            ? 'primary'
                            : tour.type === 'bus'
                            ? 'secondary'
                            : 'success'
                        }
                      />
                      <Chip
                        label={tour.difficulty}
                        size="small"
                        color={
                          tour.difficulty === 'easy'
                            ? 'success'
                            : tour.difficulty === 'moderate'
                            ? 'warning'
                            : 'error'
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {tour.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <FavoriteButton tourId={tour.id} size="small" />
                        <OfflineButton tourId={tour.id} size="small" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {tour.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {Math.floor(tour.duration / 60) > 0
                          ? `${Math.floor(tour.duration / 60)}h ${tour.duration % 60}min`
                          : `${tour.duration}min`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                        •
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tour.distance} km
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating
                        value={tour.ratingsAverage}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({tour.ratingsQuantity})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon />
                      <Typography variant="h6" component="span">
                        {tour.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        per person
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/tours/${tour.id}/details`}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      component={RouterLink}
                      to={`/tours/${tour.id}/book`}
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No tours found matching your criteria</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search term
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "medium" : "large"}
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={isMobile ? 1 : 2}
            sx={{
              '& .MuiPaginationItem-root': {
                minWidth: isMobile ? '36px' : '40px',
                height: isMobile ? '36px' : '40px',
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

export default ToursPage;
