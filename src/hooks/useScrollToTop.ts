import { useRef, useCallback } from 'react';

/**
 * A hook that provides a ref and a function to scroll the nearest scrollable parent to the top.
 * Useful for scrolling to the top of a specific content area (like a tab or modal)
 * rather than the entire window.
 */
export function useScrollToTop<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  const scrollToTop = useCallback(() => {
    setTimeout(() => {
      // 1. Try generic window scroll first (for standard pages)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // 2. Find and scroll the nearest scrollable parent (for nested layouts/tabs)
      if (ref.current) {
        let parent: HTMLElement | null = ref.current.parentElement;

        while (parent) {
          const style = window.getComputedStyle(parent);
          const isOverflow =
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll' ||
            style.overflow === 'auto' ||
            style.overflow === 'scroll';

          // If this element has scroll behavior, force it to 0
          if (isOverflow) {
            parent.scrollTo({ top: 0, behavior: 'smooth' });
            // Stop once we find the immediate scroll container
            break;
          }
          parent = parent.parentElement;
        }
      }
    }, 100); // 100ms delay to allow DOM paint/layout updates
  }, []);

  return { ref, scrollToTop };
}
