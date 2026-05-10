#import "CounterBridge.h"
#include "../cpp/CounterStore.h"

@implementation CounterBridge {
  counter::CounterStore _store;
  CounterChangeBlock _block;
}

+ (instancetype)shared {
  static CounterBridge *instance;
  static dispatch_once_t token;
  dispatch_once(&token, ^{ instance = [[CounterBridge alloc] init]; });
  return instance;
}

- (instancetype)init {
  if (self = [super init]) {
    __weak CounterBridge *weakSelf = self;
    // Use an Obj-C block (not a C++ lambda) so ARC manages __weak correctly.
    // Call _block directly — expo-modules-core sendEvent is thread-safe.
    void (^changeBlock)(int32_t) = ^(int32_t value) {
      CounterBridge *strongSelf = weakSelf;
      if (!strongSelf) return;
      CounterChangeBlock block = strongSelf->_block;
      if (!block) return;
      // Dispatch to main queue so sendEvent is called after the JSI call
      // stack unwinds — calling it synchronously from within a JSI call
      // can silently drop the event on New Architecture.
      dispatch_async(dispatch_get_main_queue(), ^{
        block((NSInteger)value);
      });
    };
    _store.setOnChange(std::function<void(int32_t)>(changeBlock));
  }
  return self;
}

- (NSInteger)getValue { return static_cast<NSInteger>(_store.getValue()); }
- (void)increment    { _store.increment(); }
- (void)decrement    { _store.decrement(); }
- (void)reset        { _store.reset(); }

- (void)setOnChange:(CounterChangeBlock)block {
  _block = [block copy];
}

- (void)invalidate {
  _store.invalidate();
  _block = nil;
}

@end
