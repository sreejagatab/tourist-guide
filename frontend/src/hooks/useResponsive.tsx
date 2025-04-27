import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Custom hook for responsive design
 * Provides easy access to breakpoint checks
 */
export default function useResponsive() {
  const theme = useTheme();
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isLargeDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    
    // Specific breakpoint checks
    isExtraSmall: useMediaQuery(theme.breakpoints.down('xs')),
    isSmall: useMediaQuery(theme.breakpoints.down('sm')),
    isMedium: useMediaQuery(theme.breakpoints.down('md')),
    isLarge: useMediaQuery(theme.breakpoints.down('lg')),
    
    // Custom breakpoint checks
    down: (breakpoint) => useMediaQuery(theme.breakpoints.down(breakpoint)),
    up: (breakpoint) => useMediaQuery(theme.breakpoints.up(breakpoint)),
    between: (start, end) => useMediaQuery(theme.breakpoints.between(start, end)),
    
    // Current breakpoint name
    breakpoint: 
      useMediaQuery(theme.breakpoints.only('xs')) ? 'xs' :
      useMediaQuery(theme.breakpoints.only('sm')) ? 'sm' :
      useMediaQuery(theme.breakpoints.only('md')) ? 'md' :
      useMediaQuery(theme.breakpoints.only('lg')) ? 'lg' : 'xl',
  };
}
