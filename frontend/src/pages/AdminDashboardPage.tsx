import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PeopleAlt as PeopleAltIcon,
  Map as MapIcon,
  BookOnline as BookOnlineIcon,
  StarRate as StarRateIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import BookingService from '../services/booking.service';
import TourService from '../services/tour.service';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings
        const bookingsResponse = await BookingService.getAllBookings();
        setBookings(bookingsResponse.bookings);
        
        // Fetch tours
        const toursResponse = await TourService.getAllTours();
        setTours(toursResponse.tours);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Mock data for dashboard
  const dashboardData = {
    totalUsers: 156,
    totalTours: tours.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
    recentBookings: bookings.slice(0, 5),
    popularTours: tours.sort((a, b) => b.ratingsAverage - a.ratingsAverage).slice(0, 5),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Alert severity="error">
        You do not have permission to access this page.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.totalUsers}
                  </Typography>
                </Box>
                <PeopleAltIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tours
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.totalTours}
                  </Typography>
                </Box>
                <MapIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Bookings
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.totalBookings}
                  </Typography>
                </Box>
                <BookOnlineIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${dashboardData.totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dashboard Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin dashboard tabs"
        >
          <Tab label="Recent Bookings" id="admin-tab-0" />
          <Tab label="Popular Tours" id="admin-tab-1" />
          <Tab label="Users" id="admin-tab-2" />
        </Tabs>

        {/* Recent Bookings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Recent Bookings
            </Typography>
            <Button variant="outlined">View All Bookings</Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Tour</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.recentBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {typeof booking.tour === 'string' 
                        ? booking.tour.substring(0, 8) + '...' 
                        : booking.tour.name}
                    </TableCell>
                    <TableCell>
                      {typeof booking.user === 'string' 
                        ? booking.user.substring(0, 8) + '...' 
                        : booking.user.username}
                    </TableCell>
                    <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                    <TableCell>${booking.totalAmount}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Popular Tours Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Popular Tours
            </Typography>
            <Button variant="outlined">Manage Tours</Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tour Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Bookings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.popularTours.map((tour) => (
                  <TableRow key={tour._id}>
                    <TableCell>{tour.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={tour.type}
                        size="small"
                        color={
                          tour.type === 'walking'
                            ? 'primary'
                            : tour.type === 'bus'
                            ? 'secondary'
                            : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell>${tour.price}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarRateIcon sx={{ color: 'warning.main', mr: 0.5 }} fontSize="small" />
                        {tour.ratingsAverage} ({tour.ratingsQuantity})
                      </Box>
                    </TableCell>
                    <TableCell>
                      {/* This would be actual booking count in a real implementation */}
                      {Math.floor(Math.random() * 50) + 1}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1">
            User management functionality will be implemented in the next phase.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Revenue Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Revenue Overview
          </Typography>
          <TrendingUpIcon color="primary" />
        </Box>
        <Typography variant="body1">
          Revenue chart will be implemented in the next phase.
        </Typography>
        <Box
          sx={{
            height: 300,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            mt: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Chart Placeholder
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboardPage;
