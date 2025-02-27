import React from "react";

interface LoadingLettersProps {
  text: string;
  loadingDuration: number;
  interval: number;
  className?: string;
  placeholderChar?: string;
}

export function LoadingLetters({
  text,
  loadingDuration,
  interval,
  className,
  placeholderChar = "_",
}: LoadingLettersProps) {
  const [displayText, setDisplayText] = React.useState<string>(
    placeholderChar.repeat(text.length)
  );
  const [intervalId, setIntervalId] = React.useState<number | null>(null);
  const [timeoutId, setTimeoutId] = React.useState<number | null>(null);
  const validLetters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  React.useEffect(() => {
    let currentText = placeholderChar.repeat(text.length);
    let currentIndex = 0;

    const randomizeLetters = () => {
      let newText = "";
      for (let i = 0; i < text.length; i++) {
        if (i < currentIndex) {
          newText += text[i];
        } else {
          newText +=
            validLetters[Math.floor(Math.random() * validLetters.length)];
        }
      }
      setDisplayText(newText);

      if (currentText[currentIndex] === text[currentIndex]) {
        currentIndex++;
      }

      currentText =
        currentText.substring(0, currentIndex) +
        text[currentIndex] +
        currentText.substring(currentIndex + 1);
    };

    const id = window.setInterval(randomizeLetters, interval);
    setIntervalId(id);

    const timeout = window.setTimeout(() => {
      window.clearInterval(id); // Stop the interval
      setIntervalId(null);
      setDisplayText(text); // Ensure the final text is displayed
    }, loadingDuration);
    setTimeoutId(timeout);

    // Cleanup function: Clear the interval and timeout when the component unmounts or when loadingDuration/interval changes
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [text, loadingDuration, interval, placeholderChar]); // Re-run the effect if these props change.  Crucial!

  return <span className={className}>{displayText}</span>;
}
