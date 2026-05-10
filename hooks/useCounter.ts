import { useCallback, useEffect, useRef, useState } from 'react';
import CounterNative, { subscribe } from '../modules/counter/src/CounterModule';

export const useCounter = () => {
  const [count, setCount] = useState(() => CounterNative?.getValue() ?? 0);
  const [history, setHistory] = useState<number[]>([]);
  const [incrementProgress, setIncrementProgress] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [lastInteractionAt, setLastInteractionAt] = useState(Date.now());

  const prevCountRef = useRef<number | null>(null);
  const incrementCallCountRef = useRef(0);
  const longPressRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const autoDecrIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const resetIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // NativeModule: subscribe to C++ counter events via expo-modules-core EventEmitter.
  useEffect(() => {
    if (!CounterNative) return;
    const sub = subscribe((v) => setCount(v));
    return () => { sub.remove(); };
  }, []);

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
    if (CounterNative) return;
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

  // NativeModule: mirror idle badge — C++ handles the actual decrement.
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 3000);
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(resetIntervalRef.current);
      clearInterval(longPressRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  const increment = useCallback(() => {
    incrementCallCountRef.current += 1;
    const progress = incrementCallCountRef.current % 5;
    setIncrementProgress(progress);
    if (CounterNative) {
      console.log("[NativeModule]: increment");
      CounterNative.increment();
      resetIdleTimer();
    } else {
      setCount(c => c + (progress === 0 ? 5 : 1));
      setLastInteractionAt(Date.now());
    }
  }, [resetIdleTimer]);

  const decrement = useCallback(() => {
    if (CounterNative) {
      console.log("[NativeModule]: decrement");
      CounterNative.decrement();
      resetIdleTimer();
    } else {
      setCount(c => Math.max(0, c - 1));
      setLastInteractionAt(Date.now());
    }
  }, [resetIdleTimer]);

  const reset = useCallback(() => {
    incrementCallCountRef.current = 0;
    setIncrementProgress(0);
    if (CounterNative) {
      console.log("[NativeModule]: reset");
      CounterNative.reset();
      resetIdleTimer();
    } else {
      clearInterval(resetIntervalRef.current);
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
    }
  }, [resetIdleTimer]);

  const startLongPress = useCallback(() => {
    longPressRef.current = setInterval(increment, 100);
  }, [increment]);

  const stopLongPress = useCallback(() => {
    clearInterval(longPressRef.current);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

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
