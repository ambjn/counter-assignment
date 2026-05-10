#pragma once

#include <atomic>
#include <functional>
#include <mutex>
#include <thread>

namespace counter {

class CounterStore {
public:
  using ChangeCallback = std::function<void(int32_t value)>;

  CounterStore() = default;
  ~CounterStore();

  void increment();
  void decrement();
  void reset();
  int32_t getValue() const;

  void setOnChange(ChangeCallback cb);
  void invalidate();

private:
  std::atomic<int32_t> value_{0};
  int32_t callCount_{0};

  ChangeCallback onChange_;
  mutable std::mutex callbackMutex_;

  std::atomic<bool> idleRunning_{false};
  std::atomic<uint64_t> idleGeneration_{0};
  std::thread idleThread_;

  std::atomic<bool> resetRunning_{false};
  std::thread resetThread_;

  void emitChange();
  void restartIdleTimer();
  void stopIdleTimer();
  void stopReset();
};

}
