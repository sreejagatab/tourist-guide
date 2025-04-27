import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              TourGuide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
              Discover the world with our guided tours. Experience local culture, history, and
              attractions with our expert guides.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Link href="#" color="inherit">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit">
                <TwitterIcon />
              </Link>
              <Link href="#" color="inherit">
                <InstagramIcon />
              </Link>
              <Link href="#" color="inherit">
                <YouTubeIcon />
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Tours
            </Typography>
            <Link
              component={RouterLink}
              to="/tours/walking"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Walking Tours
            </Link>
            <Link
              component={RouterLink}
              to="/tours/bus"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Bus Tours
            </Link>
            <Link
              component={RouterLink}
              to="/tours/bike"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Bike Tours
            </Link>
            <Link
              component={RouterLink}
              to="/itineraries"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Custom Itineraries
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <Link
              component={RouterLink}
              to="/about"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              About Us
            </Link>
            <Link
              component={RouterLink}
              to="/contact"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Contact Us
            </Link>
            <Link
              component={RouterLink}
              to="/careers"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Careers
            </Link>
            <Link
              component={RouterLink}
              to="/blog"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Blog
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Link
              component={RouterLink}
              to="/faq"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              FAQ
            </Link>
            <Link
              component={RouterLink}
              to="/help"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Help Center
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Terms of Service
            </Link>
            <Link
              component={RouterLink}
              to="/privacy"
              color="inherit"
              sx={{ display: 'block', mb: 1, textDecoration: 'none' }}
            >
              Privacy Policy
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'grey.800' }} />

        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'grey.500' }}>
          © {new Date().getFullYear()} TourGuide. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
