import { requireNativeView } from 'expo';
import * as React from 'react';

import { CounterViewProps } from './Counter.types';

const NativeView: React.ComponentType<CounterViewProps> =
  requireNativeView('Counter');

export default function CounterView(props: CounterViewProps) {
  return <NativeView {...props} />;
}
