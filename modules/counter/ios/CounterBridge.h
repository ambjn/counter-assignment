#pragma once
#import <Foundation/Foundation.h>

typedef void (^CounterChangeBlock)(NSInteger value);

// Pure Obj-C interfaces here so that swift can import this directly, no cpp issue fix
@interface CounterBridge : NSObject
+ (instancetype)shared;
- (NSInteger)getValue;
- (void)increment;
- (void)decrement;
- (void)reset;
- (void)setOnChange:(CounterChangeBlock)block;
- (void)invalidate;
@end
