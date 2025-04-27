import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  useTheme,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import useResponsive from '../../hooks/useResponsive';

// Mock data for the analytics dashboard
// In a real implementation, this would come from your backend API
const mockPageViewData = [
  { name: 'Home', views: 1200 },
  { name: 'Tours', views: 800 },
  { name: 'Tour Details', views: 600 },
  { name: 'Booking', views: 400 },
  { name: 'Profile', views: 300 },
  { name: 'Login', views: 250 },
  { name: 'Register', views: 150 },
];

const mockUserActivityData = [
  { date: '2023-01', users: 120, bookings: 45, reviews: 20 },
  { date: '2023-02', users: 140, bookings: 55, reviews: 25 },
  { date: '2023-03', users: 160, bookings: 65, reviews: 30 },
  { date: '2023-04', users: 180, bookings: 75, reviews: 35 },
  { date: '2023-05', users: 200, bookings: 85, reviews: 40 },
  { date: '2023-06', users: 220, bookings: 95, reviews: 45 },
];

const mockDeviceData = [
  { name: 'Desktop', value: 55 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 10 },
];

const mockBrowserData = [
  { name: 'Chrome', value: 60 },
  { name: 'Safari', value: 20 },
  { name: 'Firefox', value: 10 },
  { name: 'Edge', value: 8 },
  { name: 'Other', value: 2 },
];

const mockTourTypeData = [
  { name: 'Walking Tours', value: 40 },
  { name: 'Bus Tours', value: 35 },
  { name: 'Bike Tours', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const { isMobile } = useResponsive();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
    // In a real implementation, this would trigger a data refresh
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Summary metrics
  const summaryMetrics = [
    { title: 'Total Users', value: '1,245', change: '+12%' },
    { title: 'Active Users', value: '856', change: '+8%' },
    { title: 'Total Bookings', value: '432', change: '+15%' },
    { title: 'Conversion Rate', value: '3.2%', change: '+0.5%' },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range-select"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {metric.title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                  {metric.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: metric.change.startsWith('+') ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {metric.change} from previous period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : undefined}
        >
          <Tab label="Overview" />
          <Tab label="User Activity" />
          <Tab label="Device & Browser" />
          <Tab label="Content Performance" />
        </Tabs>
        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Page Views
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={mockPageViewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Tour Bookings by Type
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={mockTourTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {mockTourTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tour Booking Insights
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Walking tours are the most popular option, accounting for 40% of all bookings.
                        Bus tours follow closely at 35%, while bike tours make up 25% of bookings.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        The most popular walking tour is "Historic City Center" with 120 bookings this month.
                      </Typography>
                      <Button variant="outlined" color="primary">
                        View Detailed Report
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* User Activity Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                User Activity Over Time
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer>
                  <LineChart data={mockUserActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="bookings" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="reviews" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        User Retention
                      </Typography>
                      <Typography variant="h4">68%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly active users who return within 30 days
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Average Session Duration
                      </Typography>
                      <Typography variant="h4">4m 32s</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average time users spend on the platform
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Bounce Rate
                      </Typography>
                      <Typography variant="h4">32%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users who leave after viewing only one page
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Device & Browser Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Device Distribution
                  </Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={mockDeviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {mockDeviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Browser Distribution
                  </Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={mockBrowserData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {mockBrowserData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Device Performance Insights
                </Typography>
                <Card>
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      Mobile users have a 15% higher bounce rate compared to desktop users.
                      The average session duration on mobile is 3m 12s, compared to 5m 45s on desktop.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Chrome users convert at a rate of 4.2%, while Safari users convert at 3.8%.
                    </Typography>
                    <Button variant="contained" color="primary">
                      Download Device Report
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>

            {/* Content Performance Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Most Viewed Tours
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { name: 'Historic City Walk', views: 450, bookings: 120 },
                      { name: 'Sunset Bike Tour', views: 380, bookings: 95 },
                      { name: 'City Bus Tour', views: 320, bookings: 85 },
                      { name: 'Food Tasting Walk', views: 280, bookings: 70 },
                      { name: 'Night City Lights', views: 250, bookings: 60 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill={theme.palette.primary.main} />
                    <Bar dataKey="bookings" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Content Engagement Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Average Time on Page
                      </Typography>
                      <Typography variant="h4">2m 15s</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average time spent on tour detail pages
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tour to Booking Conversion
                      </Typography>
                      <Typography variant="h4">24%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Visitors who book after viewing tour details
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Review Submission Rate
                      </Typography>
                      <Typography variant="h4">38%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customers who leave reviews after tours
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;
