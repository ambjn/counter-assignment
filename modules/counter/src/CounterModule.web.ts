import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './Counter.types';

type CounterModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class CounterModule extends NativeModule<CounterModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(CounterModule, 'CounterModule');
