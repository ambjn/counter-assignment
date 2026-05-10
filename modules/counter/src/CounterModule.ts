import { NativeModule, requireNativeModule } from 'expo';

import { CounterModuleEvents } from './Counter.types';

declare class CounterModule extends NativeModule<CounterModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CounterModule>('Counter');
