import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface SkipLinkProps {
  mainContentId: string;
}

const StyledSkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  top: '-40px',
  left: 0,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  zIndex: 9999,
  textDecoration: 'none',
  borderRadius: '0 0 4px 0',
  fontWeight: 500,
  transition: 'top 0.2s ease-in-out',
  '&:focus': {
    top: 0,
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: '2px',
  },
}));

/**
 * SkipLink component for keyboard users to skip to main content
 * This is an accessibility feature that helps keyboard users bypass navigation
 */
const SkipLink: React.FC<SkipLinkProps> = ({ mainContentId }) => {
  const { t } = useTranslation();
  
  return (
    <StyledSkipLink href={`#${mainContentId}`}>
      {t('accessibility.skipToContent', 'Skip to main content')}
    </StyledSkipLink>
  );
};

export default SkipLink;
