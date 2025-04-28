import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Tooltip,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAnalytics } from '../../context/AnalyticsContext';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  variant?: 'icon' | 'text' | 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default' | 'inherit';
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  description = '',
  url = window.location.href,
  imageUrl = '',
  variant = 'icon',
  size = 'medium',
  color = 'default',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  
  const { trackFeatureUsage } = useAnalytics();
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    trackFeatureUsage('Sharing', 'Open Share Menu');
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const handleEmailDialogOpen = () => {
    setEmailDialogOpen(true);
    handleClose();
  };
  
  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
  };
  
  const handleEmailSubmit = () => {
    // Validate email
    if (!emailTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
      setSnackbarMessage('Please enter a valid email address');
      setSnackbarOpen(true);
      return;
    }
    
    // Construct email link
    const subject = encodeURIComponent(`Check out this tour: ${title}`);
    const body = encodeURIComponent(
      `${emailMessage || 'I thought you might be interested in this:'}\n\n${title}\n${description}\n\n${url}`
    );
    
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`);
    
    trackFeatureUsage('Sharing', 'Email Share', { title });
    
    // Reset and close dialog
    setEmailTo('');
    setEmailMessage('');
    setEmailDialogOpen(false);
    
    // Show success message
    setSnackbarMessage('Email client opened');
    setSnackbarOpen(true);
  };
  
  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url)
          .then(() => {
            setSnackbarMessage('Link copied to clipboard');
            setSnackbarOpen(true);
          })
          .catch(() => {
            setSnackbarMessage('Failed to copy link');
            setSnackbarOpen(true);
          });
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    trackFeatureUsage('Sharing', `${platform} Share`, { title });
    handleClose();
  };
  
  // Check if Web Share API is available
  const isWebShareAvailable = navigator.share !== undefined;
  
  const handleNativeShare = async () => {
    if (!isWebShareAvailable) return;
    
    try {
      await navigator.share({
        title,
        text: description,
        url,
      });
      
      trackFeatureUsage('Sharing', 'Native Share', { title });
      setSnackbarMessage('Shared successfully');
      setSnackbarOpen(true);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setSnackbarMessage('Failed to share');
        setSnackbarOpen(true);
      }
    }
  };
  
  // Render button based on variant
  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <Tooltip title="Share">
          <IconButton
            onClick={isWebShareAvailable ? handleNativeShare : handleClick}
            size={size}
            color={color}
            aria-label="share"
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      );
    }
    
    return (
      <Button
        variant={variant}
        size={size}
        color={color}
        startIcon={<ShareIcon />}
        onClick={isWebShareAvailable ? handleNativeShare : handleClick}
      >
        Share
      </Button>
    );
  };
  
  return (
    <>
      {renderButton()}
      
      {/* Share Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleShare('facebook')}>
          <ListItemIcon>
            <FacebookIcon style={{ color: '#3b5998' }} />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('twitter')}>
          <ListItemIcon>
            <TwitterIcon style={{ color: '#1da1f2' }} />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('whatsapp')}>
          <ListItemIcon>
            <WhatsAppIcon style={{ color: '#25d366' }} />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEmailDialogOpen}>
          <ListItemIcon>
            <EmailIcon style={{ color: '#ea4335' }} />
          </ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('copy')}>
          <ListItemIcon>
            <ContentCopyIcon />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={handleEmailDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Share via Email</Typography>
            <IconButton edge="end" color="inherit" onClick={handleEmailDialogClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <TextField
              label="Recipient Email"
              type="email"
              fullWidth
              margin="normal"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TextField
            label="Personal Message (Optional)"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="Add a personal message..."
          />
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              This will open your default email client with a pre-filled message.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEmailSubmit} color="primary" variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareButton;
