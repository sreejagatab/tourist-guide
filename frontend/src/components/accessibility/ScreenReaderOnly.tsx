import React from 'react';
import { styled } from '@mui/material/styles';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: React.ElementType;
  id?: string;
}

// This component is visually hidden but accessible to screen readers
const StyledScreenReaderOnly = styled('span')({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

/**
 * Component for text that is only visible to screen readers
 * This follows best practices for visually hiding content while keeping it accessible
 */
const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  as = 'span',
  id
}) => {
  return (
    <StyledScreenReaderOnly as={as} id={id}>
      {children}
    </StyledScreenReaderOnly>
  );
};

export default ScreenReaderOnly;
