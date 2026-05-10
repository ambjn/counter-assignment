// Reexport the native module. On web, it will be resolved to CounterModule.web.ts
// and on native platforms to CounterModule.ts
export { default } from './src/CounterModule';
export { default as CounterView } from './src/CounterView';
export * from  './src/Counter.types';
