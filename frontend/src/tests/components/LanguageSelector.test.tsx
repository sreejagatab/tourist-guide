import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LanguageSelector from '../../components/language/LanguageSelector';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

// Mock the analytics context
jest.mock('../../context/AnalyticsContext', () => ({
  useAnalytics: () => ({
    trackFeatureUsage: jest.fn(),
  }),
}));

// Create a wrapper component with all required providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('LanguageSelector Component', () => {
  test('renders language icon button by default', () => {
    customRender(<LanguageSelector />);
    
    // Check if the language icon button is rendered
    const iconButton = screen.getByLabelText(/language/i);
    expect(iconButton).toBeInTheDocument();
  });
  
  test('renders text button when variant is text', () => {
    customRender(<LanguageSelector variant="text" />);
    
    // Check if the button with language code is rendered
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/[A-Z]{2}/); // Language code should be 2 uppercase letters
  });
  
  test('renders full button when variant is full', () => {
    customRender(<LanguageSelector variant="full" />);
    
    // Check if the button with language name is rendered
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/English|Español|Français|Deutsch|Italiano|中文|日本語/);
  });
  
  test('opens language menu when clicked', () => {
    customRender(<LanguageSelector />);
    
    // Click the language button
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Check if the menu is opened with language options
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });
  
  test('changes language when a language option is selected', () => {
    const changeSpy = jest.spyOn(i18n, 'changeLanguage');
    customRender(<LanguageSelector />);
    
    // Click the language button to open the menu
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Click on the Spanish option
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    // Check if the language was changed
    expect(changeSpy).toHaveBeenCalledWith('es');
    
    // Restore the original implementation
    changeSpy.mockRestore();
  });
});
