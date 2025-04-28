import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MobileSearchBar from '../../components/search/MobileSearchBar';
import { AnalyticsProvider } from '../../context/AnalyticsContext';

// Mock the useAnalytics hook
jest.mock('../../context/AnalyticsContext', () => ({
  ...jest.requireActual('../../context/AnalyticsContext'),
  useAnalytics: () => ({
    trackEvent: jest.fn(),
    trackFeatureUsage: jest.fn(),
    trackError: jest.fn(),
  }),
}));

// Create a wrapper component with all required providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('MobileSearchBar Component', () => {
  // Mock props
  const mockProps = {
    searchTerm: '',
    onSearchChange: jest.fn(),
    sortBy: 'recommended',
    onSortChange: jest.fn(),
    priceRange: 'all',
    onPriceRangeChange: jest.fn(),
    difficulty: 'all',
    onDifficultyChange: jest.fn(),
  };
  
  test('renders search input', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    expect(screen.getByPlaceholderText('Search tours...')).toBeInTheDocument();
  });
  
  test('renders filter button', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    const filterButton = screen.getByRole('button');
    expect(filterButton).toBeInTheDocument();
  });
  
  test('opens filter drawer when filter button is clicked', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    // Click the filter button
    const filterButton = screen.getByRole('button');
    fireEvent.click(filterButton);
    
    // Check if the drawer is open
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });
  
  test('calls onSearchChange when search input changes', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    // Change the search input
    const searchInput = screen.getByPlaceholderText('Search tours...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Check if onSearchChange was called
    expect(mockProps.onSearchChange).toHaveBeenCalled();
  });
  
  test('shows sort options in the filter drawer', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    // Open the filter drawer
    const filterButton = screen.getByRole('button');
    fireEvent.click(filterButton);
    
    // Check if sort options are shown
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
  });
  
  test('shows price range options in the filter drawer', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    // Open the filter drawer
    const filterButton = screen.getByRole('button');
    fireEvent.click(filterButton);
    
    // Check if price range options are shown
    expect(screen.getByLabelText('Price Range')).toBeInTheDocument();
  });
  
  test('shows difficulty options in the filter drawer', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    // Open the filter drawer
    const filterButton = screen.getByRole('button');
    fireEvent.click(filterButton);
    
    // Check if difficulty options are shown
    expect(screen.getByLabelText('Difficulty')).toBeInTheDocument();
  });
  
  test('closes filter drawer when Apply Filters button is clicked', () => {
    customRender(<MobileSearchBar {...mockProps} />);
    
    // Open the filter drawer
    const filterButton = screen.getByRole('button');
    fireEvent.click(filterButton);
    
    // Click the Apply Filters button
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);
    
    // Check if the drawer is closed
    expect(screen.queryByText('Apply Filters')).not.toBeInTheDocument();
  });
});
