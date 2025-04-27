import React, { ReactNode, useEffect, useState } from 'react';
import { Box, Container, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import useResponsive from '../../hooks/useResponsive';

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
      <Header />
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          py: paddingY,
          px: { xs: 2, sm: 3, md: 4 }, // Responsive horizontal padding
          transition: theme.transitions.create(['padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
        maxWidth="lg"
      >
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
