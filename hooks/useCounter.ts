import { useCallback, useEffect, useRef, useState } from 'react';

export const useCounter = () => {

  const [count, setCount] = useState(0);
  const [lastInteractionAt, setLastInteractionAt] = useState(Date.now());
  const [history, setHistory] = useState<number[]>([]);
  const [incrementProgress, setIncrementProgress] = useState(0);
  const [isIdle, setIsIdle] = useState(false);

  const incrementCallCountRef = useRef(0);
  const autoDecrIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const resetIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const longPressRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const prevCountRef = useRef<number | null>(null);

  const increment = useCallback(() => {
    incrementCallCountRef.current += 1;
    const progress = incrementCallCountRef.current % 5;
    setIncrementProgress(progress);
    const deltaVariable = progress === 0 ? 5 : 1;
    setCount(c => c + deltaVariable)
    setLastInteractionAt(Date.now());
  }, []);

  const decrement = useCallback(() => {
    setCount(c => Math.max(0, c - 1));
    setLastInteractionAt(Date.now());
  }, []);

  const reset = useCallback(() => {
    clearInterval(resetIntervalRef.current);
    incrementCallCountRef.current = 0;
    setIncrementProgress(0);
    setLastInteractionAt(Date.now());
    resetIntervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 0) {
          clearInterval(resetIntervalRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 50);
  }, []);

  const startLongPress = useCallback(() => {
    longPressRef.current = setInterval(increment, 100);
  }, [increment]);

  const stopLongPress = useCallback(() => {
    clearInterval(longPressRef.current);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  // push previous value into history on every count change
  useEffect(() => {
    if (prevCountRef.current !== null && prevCountRef.current !== count) {
      const prev = prevCountRef.current;
      setHistory(h => [prev, ...h].slice(0, 10));
    }
    prevCountRef.current = count;
  }, [count]);

  // if 3 secods idle -> auto-decrement every 1 seconds
  useEffect(() => {
    setIsIdle(false);
    const idleTimer = setTimeout(() => {
      setIsIdle(true);
      autoDecrIntervalRef.current = setInterval(() => {
        setCount(c => Math.max(0, c - 1));
      }, 1000);
    }, 3000);

    return () => {
      clearTimeout(idleTimer);
      clearInterval(autoDecrIntervalRef.current);
    };
  }, [lastInteractionAt]);

  useEffect(() => {
    return () => {
      clearInterval(resetIntervalRef.current);
      clearInterval(longPressRef.current);
    };
  }, []);

  return {
    count,
    increment,
    decrement,
    reset,
    history,
    clearHistory,
    startLongPress,
    stopLongPress,
    incrementProgress,
    isIdle,
  };
}

