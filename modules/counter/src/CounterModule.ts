import { requireOptionalNativeModule } from 'expo-modules-core';
import type { CounterChangeEvent } from './Counter.types';

type CounterEventsMap = {
  onValueChanged: (event: CounterChangeEvent) => void;
};

type CounterModuleType = {
  getValue(): number;
  increment(): void;
  decrement(): void;
  reset(): void;
};

const CounterNative = requireOptionalNativeModule<CounterModuleType>('Counter');

export function subscribe(listener: (value: number) => void) {
  if (!CounterNative) return { remove: () => { } };
  // In Expo SDK 52+, the native module is itself an EventEmitter.
  return (CounterNative as any).addListener(
    'onValueChanged',
    (event: CounterChangeEvent) => listener(event.value),
  );
}

export default CounterNative;
