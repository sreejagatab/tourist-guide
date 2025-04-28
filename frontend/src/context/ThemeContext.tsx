import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeContextType = {
  mode: PaletteMode;
  toggleMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleMode: () => {},
  highContrast: false,
  toggleHighContrast: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get stored preferences from localStorage
  const [mode, setMode] = useState<PaletteMode>(() => {
    const storedMode = localStorage.getItem('themeMode');
    return (storedMode as PaletteMode) || 'light';
  });
  
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  // Update localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('highContrast', String(highContrast));
  }, [highContrast]);

  // Toggle functions
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  // Create theme based on current preferences
  const theme = useMemo(() => {
    // Base theme
    const baseTheme = createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              // Light mode colors
              primary: {
                main: highContrast ? '#0000CC' : '#1976d2',
              },
              secondary: {
                main: highContrast ? '#9900CC' : '#9c27b0',
              },
              error: {
                main: highContrast ? '#CC0000' : '#d32f2f',
              },
              warning: {
                main: highContrast ? '#CC6600' : '#ed6c02',
              },
              info: {
                main: highContrast ? '#006699' : '#0288d1',
              },
              success: {
                main: highContrast ? '#006600' : '#2e7d32',
              },
              background: {
                default: highContrast ? '#FFFFFF' : '#f5f5f5',
                paper: highContrast ? '#FFFFFF' : '#ffffff',
              },
              text: {
                primary: highContrast ? '#000000' : 'rgba(0, 0, 0, 0.87)',
                secondary: highContrast ? '#000000' : 'rgba(0, 0, 0, 0.6)',
              },
            }
          : {
              // Dark mode colors
              primary: {
                main: highContrast ? '#66CCFF' : '#90caf9',
              },
              secondary: {
                main: highContrast ? '#FF99FF' : '#ce93d8',
              },
              error: {
                main: highContrast ? '#FF6666' : '#f44336',
              },
              warning: {
                main: highContrast ? '#FFCC00' : '#ffa726',
              },
              info: {
                main: highContrast ? '#33CCFF' : '#29b6f6',
              },
              success: {
                main: highContrast ? '#33CC33' : '#66bb6a',
              },
              background: {
                default: highContrast ? '#000000' : '#121212',
                paper: highContrast ? '#121212' : '#1e1e1e',
              },
              text: {
                primary: highContrast ? '#FFFFFF' : '#ffffff',
                secondary: highContrast ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
              },
            }),
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: highContrast ? 16 : 14,
        fontWeightRegular: highContrast ? 500 : 400,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              ...(highContrast && {
                fontWeight: 700,
                borderWidth: 2,
              }),
            },
          },
        },
        MuiLink: {
          styleOverrides: {
            root: {
              ...(highContrast && {
                textDecoration: 'underline',
                fontWeight: 700,
              }),
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              ...(highContrast && {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              }),
            },
          },
        },
      },
    });

    return baseTheme;
  }, [mode, highContrast]);

  const contextValue = {
    mode,
    toggleMode,
    highContrast,
    toggleHighContrast,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
