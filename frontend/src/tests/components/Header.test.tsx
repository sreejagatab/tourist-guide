import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import { AuthProvider } from '../../context/AuthContext';

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

// Create a wrapper component with all required providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('Header Component', () => {
  test('renders the logo', () => {
    customRender(<Header />);
    
    // Check if the logo text is rendered
    expect(screen.getByText(/TOURGUIDE/i)).toBeInTheDocument();
  });
  
  test('renders navigation links', () => {
    customRender(<Header />);
    
    // Check if main navigation links are rendered
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Tours/i)).toBeInTheDocument();
  });
  
  test('shows login button when user is not authenticated', () => {
    customRender(<Header />);
    
    // Check if login button is rendered
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
  
  // Add more tests as needed
});
