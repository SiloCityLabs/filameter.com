import 'react';

declare module 'react' {
  interface CSSProperties {
    // Allow any property starting with '--' (CSS Custom Properties)
    // The value can be a string or a number (though typically strings for CSS vars)
    [key: `--${string}`]: string | number | undefined;
  }
}
