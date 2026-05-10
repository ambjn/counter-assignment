#include "CounterStore.h"
#include <chrono>

namespace counter {

CounterStore::~CounterStore() {
  stopReset();
  stopIdleTimer();
}

void CounterStore::setOnChange(ChangeCallback cb) {
  std::lock_guard<std::mutex> lock(callbackMutex_);
  onChange_ = std::move(cb);
}

void CounterStore::increment() {
  ++callCount_;
  // Every 5th tap is a bonus: adds 5 instead of 1
  int32_t step = (callCount_ % 5 == 0) ? 5 : 1;
  value_.fetch_add(step);
  restartIdleTimer();
  emitChange();
}

void CounterStore::decrement() {
  int32_t prev = value_.load();
  while (prev > 0 && !value_.compare_exchange_weak(prev, prev - 1)) {}
  restartIdleTimer();
  emitChange();
}

void CounterStore::reset() {
  callCount_ = 0;
  stopReset();
  restartIdleTimer();

  resetRunning_.store(true);
  resetThread_ = std::thread([this] {
    while (resetRunning_.load()) {
      std::this_thread::sleep_for(std::chrono::milliseconds(50));
      if (value_.load() <= 0) {
        value_.store(0);
        resetRunning_.store(false);
        emitChange();
        return;
      }
      value_.fetch_sub(1);
      emitChange();
    }
  });
  resetThread_.detach();
}

int32_t CounterStore::getValue() const {
  return value_.load();
}

void CounterStore::emitChange() {
  std::lock_guard<std::mutex> lock(callbackMutex_);
  if (onChange_) onChange_(value_.load());
}

void CounterStore::restartIdleTimer() {
  stopIdleTimer();
  uint64_t myGen = ++idleGeneration_;
  idleRunning_.store(true);
  idleThread_ = std::thread([this, myGen] {
    std::this_thread::sleep_for(std::chrono::milliseconds(3000)); // idle timeout
    while (idleRunning_.load() && idleGeneration_.load() == myGen) {
      std::this_thread::sleep_for(std::chrono::milliseconds(1000));
      if (value_.load() <= 0) return;
      value_.fetch_sub(1);
      emitChange();
    }
  });
  idleThread_.detach();
}

void CounterStore::invalidate() {
  stopReset();
  stopIdleTimer();
  std::lock_guard<std::mutex> lock(callbackMutex_);
  onChange_ = nullptr;
}

void CounterStore::stopIdleTimer() {
  idleRunning_.store(false);
}

void CounterStore::stopReset() {
  resetRunning_.store(false);
}

} 
