import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingLetters } from '../LoadingLetters';

// Define validLetters here to use in tests, ensuring it matches the component
const VALID_LETTERS_CONST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

describe('LoadingLetters Component', () => {
  beforeEach(() => {
    // Use fake timers to control setInterval and setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('renders with initial placeholder characters', () => {
    const text = 'Hello';
    const placeholder = '_';
    render(
      <LoadingLetters
        text={text}
        loadingDuration={1000}
        interval={100}
        placeholderChar={placeholder}
      />
    );
    expect(screen.getByText(placeholder.repeat(text.length))).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const customClass = 'my-loading-class';
    render(
      <LoadingLetters text='Test' loadingDuration={100} interval={50} className={customClass} />
    );
    // The text will be placeholders initially, so find by that text or use a test ID if you prefer
    const spanElement = screen.getByText('____'); // Assuming placeholder is default "_" and text is "Test"
    expect(spanElement).toHaveClass(customClass);
  });

  test('displays final text after loadingDuration', () => {
    const text = 'Finished';
    const loadingDuration = 500;
    render(<LoadingLetters text={text} loadingDuration={loadingDuration} interval={50} />);

    // Act to advance timers
    act(() => {
      jest.advanceTimersByTime(loadingDuration);
    });

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test('shows randomized characters during animation (if duration and interval allow)', () => {
    const text = 'Animate';
    const placeholder = '*';
    const intervalTime = 100;
    const loadingDuration = 1000; // Ensure duration is long enough for reveals not to happen too soon

    render(
      <LoadingLetters
        text={text}
        loadingDuration={loadingDuration}
        interval={intervalTime}
        placeholderChar={placeholder}
      />
    );

    // Initial placeholder text
    expect(screen.getByText(placeholder.repeat(text.length))).toBeInTheDocument();

    // Advance time by one randomization interval
    // At this point, if charRevealDelay for the first char is > intervalTime,
    // revealedCountRef.current should still be 0.
    // First charRevealDelay = (1000 / 7) * 1 ≈ 142ms. So at 100ms, no reveals.
    act(() => {
      jest.advanceTimersByTime(intervalTime);
    });

    const animatedTextElement = screen.getByText(
      (content) => content.length === text.length && content !== placeholder.repeat(text.length)
    );
    expect(animatedTextElement).toBeInTheDocument();
    const animatedText = animatedTextElement.textContent;

    expect(animatedText).not.toBe(text); // Should not be the final text yet
    expect(animatedText).not.toBe(placeholder.repeat(text.length)); // Should not be the placeholder text

    // Check if all characters are from the valid set (assuming no reveals yet)
    if (animatedText) {
      for (const char of animatedText) {
        expect(VALID_LETTERS_CONST).toContain(char);
      }
    }
  });

  test('handles empty text prop correctly', () => {
    render(<LoadingLetters text='' loadingDuration={100} interval={50} />);
    // The component renders a span, which would be empty.
    // We can check if the container's first child (the span) has no text content.
    const { container } = render(<LoadingLetters text='' loadingDuration={100} interval={50} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.textContent).toBe('');
  });

  test('handles loadingDuration of 0 correctly', () => {
    const text = 'Instant';
    render(<LoadingLetters text={text} loadingDuration={0} interval={50} />);

    // With loadingDuration 0, the final text should be displayed almost immediately.
    // We might need to advance timers by a minimal amount to process 0ms timeouts.
    act(() => {
      jest.advanceTimersByTime(0); // Process timeouts scheduled for 0ms
    });
    // Or jest.runAllTimers(); if there are nested 0ms timers.

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test('uses custom placeholderChar for initial display', () => {
    const text = 'Custom';
    const customPlaceholder = '%';
    render(
      <LoadingLetters
        text={text}
        loadingDuration={100}
        interval={50}
        placeholderChar={customPlaceholder}
      />
    );
    expect(screen.getByText(customPlaceholder.repeat(text.length))).toBeInTheDocument();
  });

  test('cleans up timers on unmount', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    const { unmount } = render(
      <LoadingLetters text='Test' loadingDuration={1000} interval={100} />
    );

    act(() => {
      jest.advanceTimersByTime(50);
    });

    unmount();

    // Check if clear was called for the animation interval and the final timeout.
    expect(clearIntervalSpy).toHaveBeenCalled(); // At least for animationIntervalId
    expect(clearTimeoutSpy).toHaveBeenCalled(); // At least for finalTimeoutId and charRevealTimeoutIds

    // Restore spies
    clearIntervalSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });
});
