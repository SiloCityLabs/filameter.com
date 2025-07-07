'use client';

import { useState, useEffect, useRef } from 'react';

interface LoadingLettersProps {
  text: string;
  loadingDuration: number; // Total time for the text to be revealed
  interval: number; // Interval for randomizing non-revealed letters
  className?: string;
  placeholderChar?: string;
}

export function LoadingLetters({
  text,
  loadingDuration,
  interval,
  className,
  placeholderChar = '_',
}: LoadingLettersProps) {
  // State for the text currently displayed on screen
  const [currentDisplayText, setCurrentDisplayText] = useState(() =>
    placeholderChar.repeat(text.length)
  );
  // Ref to store the count of characters that have been "revealed"
  const revealedCountRef = useRef(0);

  const validLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // Effect to initialize or reset component state when `text` or `placeholderChar` change.
  useEffect(() => {
    setCurrentDisplayText(placeholderChar.repeat(text.length));
    revealedCountRef.current = 0;
  }, [text, placeholderChar]);

  // Main animation effect: handles randomization and progressive revealing.
  useEffect(() => {
    if (text.length === 0) {
      setCurrentDisplayText(''); // Handle empty text string immediately
      return; // No animation needed for empty text.
    }

    // --- Randomization Interval ---
    // This interval updates the non-revealed part of the text with random characters.
    const animationIntervalId = setInterval(() => {
      const currentRevealedCount = revealedCountRef.current;

      // If all characters are revealed, the finalTimeout should have cleared this interval.
      if (currentRevealedCount >= text.length) {
        // If the text is fully revealed and matches the target, clear and exit.
        // This could happen if loadingDuration was very fast.
        if (currentDisplayText === text) {
          clearInterval(animationIntervalId);
          return;
        }
      }

      let newText = '';
      for (let i = 0; i < text.length; i++) {
        if (i < currentRevealedCount) {
          newText += text[i]; // Append already revealed character.
        } else {
          // Append a random character for the parts not yet revealed.
          newText += validLetters[Math.floor(Math.random() * validLetters.length)];
        }
      }
      setCurrentDisplayText(newText);
    }, interval);

    // --- Character Revealing Timers ---
    // Set up individual timeouts to increment `revealedCountRef.current` for each character.
    // This distributes the reveals over the `loadingDuration`.
    const charRevealTimeoutIds: NodeJS.Timeout[] = [];
    if (text.length > 0) {
      for (let i = 0; i < text.length; i++) {
        // Calculate delay for each character. If loadingDuration is 0, delay is 0.
        const charRevealDelay =
          (loadingDuration > 0 && text.length > 0 ? loadingDuration / text.length : 0) * (i + 1);

        const timeoutId = setTimeout(() => {
          // Increment revealed count, ensuring it doesn't go out of sync if timeouts fire out of order (unlikely but safe)
          if (revealedCountRef.current < i + 1) {
            revealedCountRef.current = i + 1;
          }
        }, charRevealDelay);
        charRevealTimeoutIds.push(timeoutId);
      }
    }

    // --- Final Timeout ---
    // Ensures that after `loadingDuration`, the animation stops, and the final text is displayed.
    const finalTimeoutId = setTimeout(() => {
      clearInterval(animationIntervalId); // Stop the randomization.
      revealedCountRef.current = text.length; // Ensure all characters are marked as revealed.
      setCurrentDisplayText(text); // Display the final, complete text.
    }, loadingDuration); // Use loadingDuration, even if 0.

    // --- Cleanup Function ---
    // Runs when the component unmounts or when dependencies change (before the effect re-runs).
    return () => {
      clearInterval(animationIntervalId);
      clearTimeout(finalTimeoutId);
      charRevealTimeoutIds.forEach(clearTimeout); // Clear all individual character reveal timeouts.
    };
  }, [text, loadingDuration, interval, placeholderChar, validLetters]); // validLetters is stable, but good for completeness

  return <span className={className}>{currentDisplayText}</span>;
}
