import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MobileBottomNavigation from '../../components/layout/MobileBottomNavigation';
import { AuthProvider } from '../../context/AuthContext';
import { AnalyticsProvider } from '../../context/AnalyticsContext';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
  }),
}));

// Mock the useAnalytics hook
jest.mock('../../context/AnalyticsContext', () => ({
  ...jest.requireActual('../../context/AnalyticsContext'),
  useAnalytics: () => ({
    trackEvent: jest.fn(),
    trackFeatureUsage: jest.fn(),
    trackError: jest.fn(),
  }),
}));

// Mock the useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: () => jest.fn(),
}));

// Create a wrapper component with all required providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AnalyticsProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('MobileBottomNavigation Component', () => {
  beforeEach(() => {
    // Reset mocks
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
  });
  
  test('renders all navigation items', () => {
    customRender(<MobileBottomNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tours')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
  
  test('highlights home tab when on home page', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
    
    customRender(<MobileBottomNavigation />);
    
    // Check that the Home tab is selected (has the primary color)
    const homeTab = screen.getByText('Home').closest('button');
    expect(homeTab).toHaveClass('Mui-selected');
  });
  
  test('highlights tours tab when on tours page', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tours' });
    
    customRender(<MobileBottomNavigation />);
    
    // Check that the Tours tab is selected
    const toursTab = screen.getByText('Tours').closest('button');
    expect(toursTab).toHaveClass('Mui-selected');
  });
  
  test('highlights search tab when on search page', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/search' });
    
    customRender(<MobileBottomNavigation />);
    
    // Check that the Search tab is selected
    const searchTab = screen.getByText('Search').closest('button');
    expect(searchTab).toHaveClass('Mui-selected');
  });
  
  test('highlights favorites tab when on favorites page', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/favorites' });
    
    customRender(<MobileBottomNavigation />);
    
    // Check that the Favorites tab is selected
    const favoritesTab = screen.getByText('Favorites').closest('button');
    expect(favoritesTab).toHaveClass('Mui-selected');
  });
  
  test('highlights profile tab when on profile page', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/profile' });
    
    customRender(<MobileBottomNavigation />);
    
    // Check that the Profile tab is selected
    const profileTab = screen.getByText('Profile').closest('button');
    expect(profileTab).toHaveClass('Mui-selected');
  });
});
