#pragma once
#import <Foundation/Foundation.h>

typedef void (^CounterChangeBlock)(NSInteger value);

// Pure Obj-C interface — no C++ includes — so Swift can import this directly.
@interface CounterBridge : NSObject
+ (instancetype)shared;
- (NSInteger)getValue;
- (void)increment;
- (void)decrement;
- (void)reset;
- (void)setOnChange:(CounterChangeBlock)block;
- (void)invalidate;
@end
