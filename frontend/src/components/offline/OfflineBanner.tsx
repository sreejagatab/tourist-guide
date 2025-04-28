import React from 'react';
import { Alert, AlertTitle, Collapse, Button, Box } from '@mui/material';
import { useOffline } from '../../context/OfflineContext';

interface OfflineBannerProps {
  showEnableButton?: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ showEnableButton = true }) => {
  const { isOnline, isOfflineEnabled, enableOfflineMode } = useOffline();
  const [dismissed, setDismissed] = React.useState<boolean>(
    localStorage.getItem('offlineBannerDismissed') === 'true'
  );

  // Don't show the banner if online and offline mode is enabled or banner was dismissed
  if ((isOnline && isOfflineEnabled) || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('offlineBannerDismissed', 'true');
  };

  const handleEnableOffline = () => {
    enableOfflineMode();
    handleDismiss();
  };

  return (
    <Collapse in={!dismissed}>
      <Alert 
        severity={isOnline ? 'info' : 'warning'}
        sx={{ mb: 2 }}
        action={
          <Box>
            {showEnableButton && isOnline && !isOfflineEnabled && (
              <Button 
                color="primary" 
                size="small" 
                onClick={handleEnableOffline}
                sx={{ mr: 1 }}
              >
                Enable
              </Button>
            )}
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleDismiss}
            >
              Dismiss
            </Button>
          </Box>
        }
      >
        <AlertTitle>{isOnline ? 'Offline Access Available' : 'You are offline'}</AlertTitle>
        {isOnline ? (
          isOfflineEnabled ? (
            'You can now browse and save tours for offline access.'
          ) : (
            'Enable offline mode to access tours without an internet connection.'
          )
        ) : (
          isOfflineEnabled ? (
            'You can still access previously saved tours and content.'
          ) : (
            'Limited functionality is available while offline.'
          )
        )}
      </Alert>
    </Collapse>
  );
};

export default OfflineBanner;
