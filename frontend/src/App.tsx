import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import BookingPage from './pages/BookingPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PaymentPage from './pages/PaymentPage';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/tours/:tourType" element={<ToursPage />} />
              <Route path="/tours/:id/details" element={<TourDetailPage />} />
              <Route path="/tours/:id/book" element={<BookingPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/:id" element={<BookingsPage />} />
                {/* Add more protected routes here */}
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/tours" element={<AdminDashboardPage />} />
                <Route path="/admin/bookings" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminDashboardPage />} />
              </Route>
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
