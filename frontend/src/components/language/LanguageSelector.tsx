import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Language as LanguageIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '../../context/AnalyticsContext';

// Language options
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

interface LanguageSelectorProps {
  variant?: 'icon' | 'text' | 'full';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default' | 'inherit';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'icon',
  size = 'medium',
  color = 'default'
}) => {
  const { i18n, t } = useTranslation();
  const { trackFeatureUsage } = useAnalytics();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    trackFeatureUsage('Language', 'Open Language Menu');
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    trackFeatureUsage('Language', 'Change Language', { language: languageCode });
    handleClose();
    
    // Save language preference to localStorage
    localStorage.setItem('i18nextLng', languageCode);
  };
  
  // Render button based on variant
  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <Tooltip title={t('common.language')}>
          <IconButton
            onClick={handleClick}
            size={size}
            color={color}
            aria-label={t('common.language')}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
      );
    }
    
    if (variant === 'text') {
      return (
        <Button
          onClick={handleClick}
          size={size}
          color={color}
          startIcon={<LanguageIcon />}
        >
          {currentLanguage.code.toUpperCase()}
        </Button>
      );
    }
    
    return (
      <Button
        onClick={handleClick}
        size={size}
        color={color}
        startIcon={<LanguageIcon />}
      >
        <Typography sx={{ mr: 1 }}>{currentLanguage.flag}</Typography>
        {currentLanguage.name}
      </Button>
    );
  };
  
  return (
    <>
      {renderButton()}
      
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
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography>{language.flag}</Typography>
            </ListItemIcon>
            <ListItemText>{language.name}</ListItemText>
            {i18n.language === language.code && (
              <CheckIcon fontSize="small" color="primary" />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
