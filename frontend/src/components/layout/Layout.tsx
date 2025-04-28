import React, { ReactNode, useEffect, useState } from 'react';
import { Box, Container, CssBaseline, useTheme } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNavigation from './MobileBottomNavigation';
import useResponsive from '../../hooks/useResponsive';
import OfflineBanner from '../offline/OfflineBanner';
import SkipLink from '../accessibility/SkipLink';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [paddingY, setPaddingY] = useState(4);

  // Adjust padding based on screen size
  useEffect(() => {
    setPaddingY(isMobile ? 2 : 4);
  }, [isMobile]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        // Add smooth transitions for responsive changes
        transition: theme.transitions.create(['padding', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <CssBaseline />
      {/* Accessibility skip link */}
      <SkipLink mainContentId="main-content" />
      <Header />
      <Container
        component="main"
        id="main-content" // ID for skip link
        tabIndex={-1} // Makes the container focusable but not in tab order
        sx={{
          flexGrow: 1,
          py: paddingY,
          px: { xs: 2, sm: 3, md: 4 }, // Responsive horizontal padding
          transition: theme.transitions.create(['padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          '&:focus': { // Style for when container is focused via skip link
            outline: 'none',
          },
        }}
        maxWidth="lg"
      >
        <OfflineBanner />
        {children}
      </Container>
      <Footer />
      <MobileBottomNavigation />
      {/* Add padding at the bottom for mobile to account for the bottom navigation */}
      <Box sx={{ height: { xs: 64, md: 0 } }} />
    </Box>
  );
};

export default Layout;
