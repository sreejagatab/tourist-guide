import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// i18n
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import AnalyticsProvider from './context/AnalyticsContext';
import OfflineProvider from './context/OfflineContext';
import ThemeProvider from './context/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import BookingPage from './pages/BookingPage';
import BookingsPage from './pages/BookingsPage';
import FavoritesPage from './pages/FavoritesPage';
import OfflineSettingsPage from './pages/OfflineSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PaymentPage from './pages/PaymentPage';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Theme is now managed by ThemeContext

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        }>
          <AuthProvider>
            <Router>
              <AnalyticsProvider>
                <OfflineProvider>
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
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/settings/offline" element={<OfflineSettingsPage />} />
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
                </OfflineProvider>
              </AnalyticsProvider>
            </Router>
          </AuthProvider>
        </Suspense>
      </I18nextProvider>
    </ThemeProvider>
  );
};

export default App;
