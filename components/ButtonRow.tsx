import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Variant = 'decrement' | 'reset' | 'increment';

const ICON_NAME: Record<Variant, keyof typeof Feather.glyphMap> = {
  decrement: 'minus',
  reset: 'refresh-ccw',
  increment: 'plus',
};

const ACCESS_LABEL: Record<Variant, string> = {
  decrement: 'Decrement',
  reset: 'Reset',
  increment: 'Increment',
};

interface ButtonProps {
  variant: Variant;
  onPress: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
}

const CounterButton = React.memo(
  function CounterButton({ variant, onPress, onLongPress, onPressOut }: ButtonProps) {
    const handlePress = useCallback(() => {
      Haptics.impactAsync(
        variant === 'reset'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      );
      onPress();
    }, [onPress, variant]);

    const isIncrement = variant === 'increment';
    const isReset = variant === 'reset';

    return (
      <Pressable
        style={[
          styles.buttonBase,
          isIncrement ? styles.incrementButton : isReset ? styles.resetButton : styles.decrementButton,
        ]}
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressOut={onPressOut}
        delayLongPress={300}
        accessibilityRole="button"
        accessibilityLabel={ACCESS_LABEL[variant]}
      >
        <Feather
          name={ICON_NAME[variant]}
          size={isReset ? 20 : 28}
          color={isIncrement ? '#0a0a0a' : isReset ? '#a3a3a3' : '#e5e5e5'}
        />
      </Pressable>
    );
  },
);

interface Props {
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onIncrementLongPress: () => void;
  onIncrementPressOut: () => void;
}

export const ButtonRow = React.memo(
  function ButtonRow({ onIncrement, onDecrement, onReset, onIncrementLongPress, onIncrementPressOut }: Props) {
    return (
      <View style={styles.row}>
        <CounterButton variant="decrement" onPress={onDecrement} />
        <CounterButton variant="reset" onPress={onReset} />
        <CounterButton
          variant="increment"
          onPress={onIncrement}
          onLongPress={onIncrementLongPress}
          onPressOut={onIncrementPressOut}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  decrementButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resetButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  incrementButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
});

