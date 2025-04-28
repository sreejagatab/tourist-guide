import { useEffect, useRef } from 'react';

interface KeyboardNavigationOptions {
  selector: string;
  onEnter?: (element: HTMLElement) => void;
  onEscape?: () => void;
  loop?: boolean;
  initialFocus?: boolean;
}

/**
 * Hook to enable keyboard navigation between elements
 * 
 * @param options Configuration options
 * @param options.selector CSS selector for focusable elements
 * @param options.onEnter Callback when Enter key is pressed on an element
 * @param options.onEscape Callback when Escape key is pressed
 * @param options.loop Whether to loop from last to first element and vice versa
 * @param options.initialFocus Whether to focus the first element on mount
 */
const useKeyboardNavigation = ({
  selector,
  onEnter,
  onEscape,
  loop = true,
  initialFocus = false
}: KeyboardNavigationOptions) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const elements = Array.from(
        container.querySelectorAll(selector)
      ) as HTMLElement[];
      
      if (!elements.length) return;

      // Find the currently focused element
      const focusedElement = document.activeElement as HTMLElement;
      const focusedIndex = elements.indexOf(focusedElement);

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          if (focusedIndex === -1 || focusedIndex === elements.length - 1) {
            if (loop) {
              elements[0].focus();
            }
          } else {
            elements[focusedIndex + 1].focus();
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedIndex === -1 || focusedIndex === 0) {
            if (loop) {
              elements[elements.length - 1].focus();
            }
          } else {
            elements[focusedIndex - 1].focus();
          }
          break;

        case 'Home':
          e.preventDefault();
          elements[0].focus();
          break;

        case 'End':
          e.preventDefault();
          elements[elements.length - 1].focus();
          break;

        case 'Enter':
        case ' ':
          if (focusedIndex !== -1 && onEnter) {
            e.preventDefault();
            onEnter(elements[focusedIndex]);
          }
          break;

        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Set initial focus if requested
    if (initialFocus) {
      const elements = container.querySelectorAll(selector);
      if (elements.length > 0) {
        (elements[0] as HTMLElement).focus();
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [selector, onEnter, onEscape, loop, initialFocus]);

  return containerRef;
};

export default useKeyboardNavigation;
