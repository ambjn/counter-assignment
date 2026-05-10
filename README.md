# Counter App

A React Native counter with non-trivial behavior, built with Expo and TypeScript. Includes a full C++ native module implementation as an advanced path.

## Running the app

**JS-only (Expo Go):**
```bash
bun install
bunx expo start
```

**With native module (requires Xcode):**
```bash
bunx expo run:ios
```

---

## Logic structure

All counter logic lives in `hooks/useCounter.ts`. The screen (`app/index.tsx`) and components (`CounterDisplay`, `ButtonRow`) are purely presentational — they receive props and fire callbacks, nothing more.

The hook detects at module load time whether the native module is available:

```ts
const CounterNative = requireOptionalNativeModule<CounterModuleType>('Counter');
```

If `CounterNative` is non-null (native build), all counter mutations go through C++. If null (Expo Go), the hook runs equivalent pure-JS logic. The component tree is unaware of which path is active. A mode badge (`NATIVE` / `JS`) in the UI reflects the active path.

---

## State

| Value | Location | Why |
|---|---|---|
| `count` | `useState` in hook | UI data — must trigger re-render |
| `history` | `useState` in hook | UI data — rendered in modal |
| `incrementProgress` | `useState` in hook | Drives the progress indicator (0–4) |
| `isIdle` | `useState` in hook | Shows auto-decrement badge |
| `lastInteractionAt` | `useState` in hook | Keys the idle `useEffect` so timers reset on interaction |
| `incrementCallCountRef` | `useRef` in hook | Bookkeeping only — no re-render needed |
| Counter value (native) | `std::atomic<int32_t>` in C++ | Owned by native, mirrored to JS via events |

No global store — counter state is local to a single screen and does not need to be shared.

---

## Counter behaviors

### Every 5th increment adds 5
A ref tracks how many times increment has been called. On the 5th call (`callCount % 5 === 0`), delta is 5 instead of 1. All `setCount` calls use the functional form `c => c + delta` so they always operate on the latest value, safe under rapid taps. The C++ path mirrors this with a plain `callCount_` member in `CounterStore` (touched only from the JS thread via JSI, so no lock needed).

### Decrement floor at 0
`Math.max(0, c - 1)` in the JS decrement and auto-decrement interval. The C++ path uses `compare_exchange_weak` in a CAS loop for the same guarantee without a mutex on the hot path.

### Auto-decrement after inactivity
After 3 seconds without interaction, the counter decrements every 1 second. In the JS path this is a `setTimeout` → `setInterval` chain inside a `useEffect` keyed on `lastInteractionAt` — any interaction updates that state, the effect cleanup cancels the timers, and a fresh 3-second window starts. In the C++ path the idle loop runs on a detached background thread; `stopIdleTimer()` sets an atomic flag and increments a generation counter the thread checks before each decrement.

### Animated reset
Reset steps the counter down by 1 every 50 ms rather than jumping to 0 instantly. The JS path uses `setInterval` (cleared and restarted if reset is pressed mid-animation). The C++ path spawns a detached thread with `sleep_for(50ms)` between decrements.

---

## Features

### Value history
Every time `count` changes, the previous value is prepended to a capped array (max 10 entries) via `useEffect`. A bottom-sheet modal shows the list with an option to clear it.

### Long-press for fast increment
`onLongPress` on the increment button starts a `setInterval(increment, 100)` — 10 taps per second. `onPressOut` clears the interval. `Pressable` handles both callbacks natively, no third-party gesture library needed.

---

## Native module implementation

The native module uses **expo-modules-core** rather than the raw TurboModule registry. This gives a clean Swift/Kotlin API surface while still allowing C++ on the hot path.

### What lives in C++

| Concern | JS path | C++ path |
|---|---|---|
| Counter value | `useState` | `std::atomic<int32_t>` in `CounterStore` |
| Every-5th bonus | `useRef` counter | `callCount_` member (plain `int32_t`) |
| Decrement floor | `Math.max` | CAS loop with `compare_exchange_weak` |
| Idle auto-decrement | `setInterval` in `useEffect` | Detached `std::thread` + generation counter |
| Animated reset | `setInterval` 50 ms | Detached `std::thread` + `sleep_for` |
| Thread safety | JS thread only | `std::mutex` on callback, atomics on value |

### File structure

```
modules/counter/
  expo-module.config.json     expo-modules-core config
  Counter.podspec             iOS pod definition

  src/
    Counter.types.ts          CounterChangeEvent type
    CounterModule.ts          requireOptionalNativeModule wrapper + subscribe()

  cpp/
    CounterStore.h/.cpp       Platform-agnostic C++ counter — all business logic

  ios/
    CounterBridge.h           Pure Obj-C header (no C++ includes — importable by Swift)
    CounterBridge.mm          Obj-C++ singleton — owns CounterStore, bridges to Swift
    CounterModule.swift       expo-modules-core Module — exposes functions and events to JS

  android/
    src/main/java/expo/modules/counter/
      CounterModule.kt        Kotlin module registered with expo-modules-core
```

### Data flow (iOS)

```
User taps Increment
  └─► JS calls CounterNative.increment()           [expo-modules-core JSI call]
        └─► CounterModule.swift
              └─► CounterBridge.shared().increment()
                    └─► CounterStore::increment()  [C++ — updates atomic value]
                          └─► emitChange()         [acquires callbackMutex_, fires onChange_]
                                └─► Obj-C changeBlock
                                      └─► dispatch_async(main_queue)  [unwinds JSI call stack first]
                                            └─► sendEvent("onValueChanged", ["value": N])
                                                  └─► JS listener → setCount(N) → React re-render
```

`getValue()` is called once on mount to hydrate the initial `count` state. After that, all updates are event-driven via `onValueChanged`.

### iOS wiring

`CounterBridge` is a singleton Obj-C++ class. The `.h` header is pure Obj-C (no C++ includes) so Swift can import it directly. The `.mm` implementation owns a `CounterStore` by value and sets an Obj-C block as the `onChange_` callback. The block dispatches to the main queue before calling `sendEvent` — calling it synchronously from within a JSI call stack silently drops the event on New Architecture.

`CounterModule.swift` is a standard expo-modules-core `Module` subclass. It declares `Events("onValueChanged")`, wires `setOnChange` in `OnCreate`, and calls `CounterBridge.shared().invalidate()` in `OnDestroy`.

### Thread safety

- `value_` is `std::atomic<int32_t>` — all reads and writes are lock-free.
- `onChange_` is guarded by `callbackMutex_` because it can be set from one thread and called from another.
- `callCount_` is a plain `int32_t` — safe because `increment()` is only ever called from the JS thread via JSI.
- `idleRunning_` and `resetRunning_` are `std::atomic<bool>` flags; background threads check them before each mutation and exit cleanly when cleared. The idle timer additionally uses an `idleGeneration_` counter so a stale thread from a previous timer cycle cannot fire.

---

## Key differences: JS vs native module

| | JS implementation | Native module (C++) |
|---|---|---|
| Call overhead | Expo-modules JSI call | Same — expo-modules-core uses JSI |
| Serialisation | None (JSI) | None |
| Threading | JS thread only | C++ background threads for idle/reset |
| State location | React `useState` | `std::atomic<int32_t>` in `CounterStore` |
| Idle timer | `setTimeout` / `setInterval` | `std::thread` + `sleep_for` + generation counter |
| Event delivery | n/a | `dispatch_async(main_queue)` → `sendEvent` |
| Build complexity | Zero native config | Podspec + expo-module.config.json |
| Works in Expo Go | Yes | No — requires `expo run:ios` |

---

## Tradeoffs

- `setInterval` for the animated reset is not frame-rate-aware. On a slow device, `requestAnimationFrame` would give smoother visual steps.
- The C++ idle and reset threads are detached. The generation-counter approach means a stale idle thread exits within one sleep interval (1 s) after being superseded. A `condition_variable` would make teardown instant but adds complexity.
- `callCount_` in C++ is a plain `int32_t`, not atomic. This is safe as long as `increment()` is only called from the JS thread via JSI — the assumption holds for the current API surface.
- The Android `CounterModule.kt` is currently scaffold code and does not wire into `CounterStore`. The C++ path is iOS-only.
