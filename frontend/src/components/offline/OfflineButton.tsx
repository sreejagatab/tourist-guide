import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useOffline } from '../../context/OfflineContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OfflineButtonProps {
  tourId: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

const OfflineButton: React.FC<OfflineButtonProps> = ({
  tourId,
  size = 'medium',
  color = '#1976d2',
  tooltipPlacement = 'top',
}) => {
  const { isOnline, isOfflineEnabled, saveForOffline, removeFromOffline, isAvailableOffline } = useOffline();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOfflineStatus = async () => {
      if (isOfflineEnabled && tourId) {
        try {
          setLoading(true);
          const available = await isAvailableOffline(tourId);
          setIsAvailable(available);
        } catch (err) {
          console.error('Error checking offline status:', err);
          setError('Failed to check offline status');
        } finally {
          setLoading(false);
        }
      }
    };

    checkOfflineStatus();
  }, [tourId, isOfflineEnabled, isAvailableOffline]);

  const handleToggleOffline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!isOfflineEnabled) {
      // Show offline settings dialog
      navigate('/settings/offline');
      return;
    }

    try {
      setLoading(true);
      
      if (isAvailable) {
        await removeFromOffline(tourId);
      } else {
        await saveForOffline(tourId);
      }
      
      setIsAvailable(!isAvailable);
    } catch (err) {
      console.error('Error toggling offline status:', err);
      setError('Failed to update offline status');
    } finally {
      setLoading(false);
    }
  };

  // Determine the tooltip text based on various states
  const getTooltipTitle = () => {
    if (!isOfflineEnabled) {
      return 'Enable offline mode in settings';
    }
    
    if (!isOnline) {
      return isAvailable 
        ? 'Available offline' 
        : 'Not available offline';
    }
    
    return isAvailable 
      ? 'Remove from offline access' 
      : 'Save for offline access';
  };

  // Determine which icon to show
  const getIcon = () => {
    if (loading) {
      return <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 28 : 24} color="inherit" />;
    }
    
    if (!isOnline) {
      return isAvailable 
        ? <CloudDoneIcon fontSize={size} /> 
        : <CloudOffIcon fontSize={size} />;
    }
    
    return isAvailable 
      ? <CloudDoneIcon fontSize={size} /> 
      : <CloudDownloadIcon fontSize={size} />;
  };

  return (
    <Tooltip title={getTooltipTitle()} placement={tooltipPlacement}>
      <IconButton
        onClick={handleToggleOffline}
        disabled={loading || (!isOnline && !isAvailable)}
        size={size}
        aria-label={isAvailable ? 'Remove from offline access' : 'Save for offline access'}
        sx={{
          color: isAvailable ? color : 'rgba(0, 0, 0, 0.54)',
          '&:hover': {
            color: color,
          },
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default OfflineButton;
