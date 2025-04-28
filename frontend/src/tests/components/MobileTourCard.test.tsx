import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MobileTourCard from '../../components/tours/MobileTourCard';
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

// Mock the FavoriteButton and OfflineButton components
jest.mock('../../components/favorites/FavoriteButton', () => ({
  __esModule: true,
  default: (props: any) => <button data-testid="favorite-button">Favorite</button>,
}));

jest.mock('../../components/offline/OfflineButton', () => ({
  __esModule: true,
  default: (props: any) => <button data-testid="offline-button">Offline</button>,
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

// Mock tour data
const mockTour = {
  _id: '123',
  name: 'Test Tour',
  description: 'This is a test tour',
  price: 99.99,
  currency: 'USD',
  duration: 120,
  distance: 5,
  difficulty: 'medium',
  ratingsAverage: 4.5,
  ratingsQuantity: 10,
  type: 'walking',
  startLocation: {
    address: 'Test Location',
    coordinates: [-73.985130, 40.748817],
  },
  images: ['test-image.jpg'],
};

describe('MobileTourCard Component', () => {
  test('renders tour name', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByText('Test Tour')).toBeInTheDocument();
  });
  
  test('renders tour location', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });
  
  test('renders tour duration and distance', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByText('2h 0min')).toBeInTheDocument();
    expect(screen.getByText('5 km')).toBeInTheDocument();
  });
  
  test('renders tour price', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByText('99.99')).toBeInTheDocument();
  });
  
  test('renders tour type chip', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByText('Walking')).toBeInTheDocument();
  });
  
  test('renders favorite and offline buttons', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
    expect(screen.getByTestId('offline-button')).toBeInTheDocument();
  });
  
  test('renders view details and book now buttons', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });
  
  test('view details button links to correct URL', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    const viewDetailsButton = screen.getByText('View Details');
    expect(viewDetailsButton.closest('a')).toHaveAttribute('href', '/tours/123/details');
  });
  
  test('book now button links to correct URL', () => {
    customRender(<MobileTourCard tour={mockTour} />);
    
    const bookNowButton = screen.getByText('Book Now');
    expect(bookNowButton.closest('a')).toHaveAttribute('href', '/tours/123/book');
  });
});
