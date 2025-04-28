import React from 'react';
import { 
  IconButton, 
  Tooltip, 
  Switch, 
  FormControlLabel, 
  Box, 
  Typography 
} from '@mui/material';
import { Contrast as ContrastIcon } from '@mui/icons-material';
import { useThemeContext } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface HighContrastToggleProps {
  variant?: 'icon' | 'switch' | 'full';
}

/**
 * Component to toggle high contrast mode
 * Provides multiple display variants for different contexts
 */
const HighContrastToggle: React.FC<HighContrastToggleProps> = ({ 
  variant = 'icon' 
}) => {
  const { highContrast, toggleHighContrast } = useThemeContext();
  const { t } = useTranslation();

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <Tooltip title={t('accessibility.toggleHighContrast', 'Toggle high contrast')}>
        <IconButton
          onClick={toggleHighContrast}
          color={highContrast ? 'primary' : 'default'}
          aria-pressed={highContrast}
          aria-label={t('accessibility.toggleHighContrast', 'Toggle high contrast')}
        >
          <ContrastIcon />
        </IconButton>
      </Tooltip>
    );
  }

  // Switch variant
  if (variant === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={highContrast}
            onChange={toggleHighContrast}
            name="highContrastSwitch"
            color="primary"
            inputProps={{
              'aria-label': t('accessibility.toggleHighContrast', 'Toggle high contrast')
            }}
          />
        }
        label={t('accessibility.highContrast', 'High contrast')}
      />
    );
  }

  // Full variant with description
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <FormControlLabel
        control={
          <Switch
            checked={highContrast}
            onChange={toggleHighContrast}
            name="highContrastSwitch"
            color="primary"
            inputProps={{
              'aria-label': t('accessibility.toggleHighContrast', 'Toggle high contrast')
            }}
          />
        }
        label={
          <Typography variant="subtitle1" fontWeight="medium">
            {t('accessibility.highContrast', 'High contrast')}
          </Typography>
        }
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
        {t(
          'accessibility.highContrastDescription',
          'Increases contrast and text size for better readability'
        )}
      </Typography>
    </Box>
  );
};

export default HighContrastToggle;
