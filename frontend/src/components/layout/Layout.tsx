import React, { ReactNode } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }} maxWidth="lg">
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
