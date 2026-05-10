import * as React from 'react';

import { CounterViewProps } from './Counter.types';

export default function CounterView(props: CounterViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
