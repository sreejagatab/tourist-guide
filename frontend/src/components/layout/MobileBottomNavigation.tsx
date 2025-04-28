import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  Favorite as FavoriteIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../context/AnalyticsContext';

const MobileBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { trackFeatureUsage } = useAnalytics();

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/tours')) return 1;
    if (path.startsWith('/search')) return 2;
    if (path.startsWith('/favorites')) return 3;
    if (path.startsWith('/profile') || path.startsWith('/login')) return 4;
    return 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        trackFeatureUsage('Navigation', 'Mobile Bottom Nav', { destination: 'Home' });
        navigate('/');
        break;
      case 1:
        trackFeatureUsage('Navigation', 'Mobile Bottom Nav', { destination: 'Tours' });
        navigate('/tours');
        break;
      case 2:
        trackFeatureUsage('Navigation', 'Mobile Bottom Nav', { destination: 'Search' });
        navigate('/search');
        break;
      case 3:
        trackFeatureUsage('Navigation', 'Mobile Bottom Nav', { destination: 'Favorites' });
        if (isAuthenticated) {
          navigate('/favorites');
        } else {
          navigate('/login', { state: { from: '/favorites' } });
        }
        break;
      case 4:
        trackFeatureUsage('Navigation', 'Mobile Bottom Nav', { destination: 'Profile' });
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          navigate('/login');
        }
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, display: { xs: 'block', md: 'none' } }}>
      <Paper elevation={3} sx={{ borderRadius: '12px 12px 0 0' }}>
        <BottomNavigation
          value={getActiveTab()}
          onChange={handleChange}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            icon={<HomeIcon />} 
            sx={{ 
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
              },
            }}
          />
          <BottomNavigationAction 
            label="Tours" 
            icon={<ExploreIcon />} 
            sx={{ 
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
              },
            }}
          />
          <BottomNavigationAction 
            label="Search" 
            icon={<SearchIcon />} 
            sx={{ 
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
              },
            }}
          />
          <BottomNavigationAction 
            label="Favorites" 
            icon={<FavoriteIcon />} 
            sx={{ 
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
              },
            }}
          />
          <BottomNavigationAction 
            label="Profile" 
            icon={<AccountCircleIcon />} 
            sx={{ 
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
              },
            }}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileBottomNavigation;
