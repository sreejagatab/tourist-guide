import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StorageIcon from '@mui/icons-material/Storage';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useOffline } from '../context/OfflineContext';
import { useAnalytics } from '../context/AnalyticsContext';
import offlineService from '../services/offline.service';
import { Tour } from '../services/tour.service';
import { useNavigate } from 'react-router-dom';

const OfflineSettingsPage: React.FC = () => {
  const { isOnline, isOfflineEnabled, enableOfflineMode, disableOfflineMode } = useOffline();
  const { trackFeatureUsage } = useAnalytics();
  const navigate = useNavigate();
  const [offlineTours, setOfflineTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOfflineTours = async () => {
      try {
        setLoading(true);
        
        // Track page view
        trackFeatureUsage('Offline', 'View Settings');
        
        // Fetch offline tours
        const tours = await offlineService.getAllOfflineTours();
        setOfflineTours(tours);
        
        // Estimate storage usage
        estimateStorageUsage();
      } catch (err: any) {
        setError('Failed to load offline data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfflineTours();
  }, [trackFeatureUsage]);

  // Estimate storage usage
  const estimateStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          setStorageUsage(estimate.usage);
        }
      }
    } catch (error) {
      console.error('Failed to estimate storage usage:', error);
    }
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle toggle offline mode
  const handleToggleOfflineMode = () => {
    if (isOfflineEnabled) {
      disableOfflineMode();
    } else {
      enableOfflineMode();
    }
  };

  // Handle remove tour from offline storage
  const handleRemoveTour = async (tourId: string) => {
    try {
      await offlineService.removeFromOffline(tourId);
      setOfflineTours(offlineTours.filter(tour => tour._id !== tourId));
      trackFeatureUsage('Offline', 'Remove Tour', { tourId });
    } catch (err: any) {
      setError('Failed to remove tour from offline storage');
      console.error(err);
    }
  };

  // Handle clear all offline data
  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        // Clear IndexedDB
        const db = await openDB();
        await db.clear('offlineTours');
        await db.clear('offlineFavorites');
        await db.clear('offlineReviews');
        
        // Clear cache if possible
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys.map(key => caches.delete(key))
          );
        }
        
        setOfflineTours([]);
        trackFeatureUsage('Offline', 'Clear All Data');
      } catch (err: any) {
        setError('Failed to clear offline data');
        console.error(err);
      }
    }
  };

  // Helper function to open IndexedDB
  const openDB = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TourGuideOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        
        // Add helper methods
        db.clear = (storeName: string) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });
        };
        
        resolve(db);
      };
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Offline Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are currently offline. Some settings may not be available.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Offline Mode
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isOfflineEnabled}
              onChange={handleToggleOfflineMode}
              color="primary"
            />
          }
          label={isOfflineEnabled ? 'Enabled' : 'Disabled'}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          When enabled, you can save tours for offline access and use the app without an internet connection.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Storage Usage</Typography>
              </Box>
              <Typography variant="h4">{formatBytes(storageUsage)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Estimated storage used by offline content
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudDownloadIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Saved Tours</Typography>
              </Box>
              <Typography variant="h4">{offlineTours.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Tours available for offline access
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Saved Tours
        </Typography>
        <Divider />
        
        {offlineTours.length > 0 ? (
          <List>
            {offlineTours.map((tour) => (
              <React.Fragment key={tour._id}>
                <ListItem button onClick={() => navigate(`/tours/${tour._id}/details`)}>
                  <ListItemText
                    primary={tour.name}
                    secondary={`${tour.type.charAt(0).toUpperCase() + tour.type.slice(1)} Tour • ${tour.duration} min`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTour(tour._id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No tours saved for offline access
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/tours')}
              sx={{ mt: 2 }}
            >
              Browse Tours
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Clear Offline Data
        </Typography>
        <Typography variant="body2" paragraph>
          This will remove all saved tours and other offline data. This action cannot be undone.
        </Typography>
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleClearAllData}
          disabled={!isOfflineEnabled || offlineTours.length === 0}
        >
          Clear All Offline Data
        </Button>
      </Paper>
    </Box>
  );
};

export default OfflineSettingsPage;
