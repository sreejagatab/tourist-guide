import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  Drawer, 
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAnalytics } from '../../context/AnalyticsContext';

interface MobileSearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (event: SelectChangeEvent) => void;
  priceRange: string;
  onPriceRangeChange: (event: SelectChangeEvent) => void;
  difficulty: string;
  onDifficultyChange: (event: SelectChangeEvent) => void;
}

const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  difficulty,
  onDifficultyChange
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { trackFeatureUsage } = useAnalytics();

  const handleOpenFilters = () => {
    setFiltersOpen(true);
    trackFeatureUsage('Search', 'Open Mobile Filters');
  };

  const handleCloseFilters = () => {
    setFiltersOpen(false);
  };

  const handleApplyFilters = () => {
    setFiltersOpen(false);
    trackFeatureUsage('Search', 'Apply Mobile Filters');
  };

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <TextField
          fullWidth
          placeholder="Search tours..."
          variant="standard"
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            disableUnderline: true,
            sx: { fontSize: '1rem' }
          }}
          sx={{ mr: 1 }}
        />
        <IconButton 
          color="primary" 
          onClick={handleOpenFilters}
          sx={{ 
            width: 48, 
            height: 48,
            borderRadius: 2
          }}
        >
          <FilterListIcon />
        </IconButton>
      </Paper>

      {/* Filters Drawer */}
      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={handleCloseFilters}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={handleCloseFilters}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="mobile-sort-label">Sort By</InputLabel>
            <Select
              labelId="mobile-sort-label"
              id="mobile-sort-select"
              value={sortBy}
              label="Sort By"
              onChange={onSortChange}
            >
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="duration-low">Duration: Short to Long</MenuItem>
              <MenuItem value="duration-high">Duration: Long to Short</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="mobile-price-label">Price Range</InputLabel>
            <Select
              labelId="mobile-price-label"
              id="mobile-price-select"
              value={priceRange}
              label="Price Range"
              onChange={onPriceRangeChange}
            >
              <MenuItem value="all">All Prices</MenuItem>
              <MenuItem value="0-25">$0 - $25</MenuItem>
              <MenuItem value="25-50">$25 - $50</MenuItem>
              <MenuItem value="50-100">$50 - $100</MenuItem>
              <MenuItem value="100">$100+</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="mobile-difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="mobile-difficulty-label"
              id="mobile-difficulty-select"
              value={difficulty}
              label="Difficulty"
              onChange={onDifficultyChange}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="difficult">Difficult</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleApplyFilters}
            sx={{ 
              mt: 2, 
              height: 56,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileSearchBar;
