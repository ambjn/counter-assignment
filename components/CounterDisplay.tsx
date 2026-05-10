import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  count: number;
  incrementProgress: number;
  isIdle: boolean;
}

export const CounterDisplay = React.memo(function CounterDisplay({ count, incrementProgress, isIdle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.number}>{count}</Text>

      <View style={styles.dotsRow}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[styles.dot, i <= incrementProgress && styles.dotActive]}
          />
        ))}
      </View>

      <View style={[styles.idleRow, { opacity: isIdle && count > 0 ? 1 : 0 }]}>
        <View style={styles.idleDot} />
        <Text style={styles.idleText}>auto-decrementing</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 60,
  },
  number: {
    fontSize: 120,
    fontWeight: '300',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
    lineHeight: 140,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    alignItems: 'center',
    height: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  idleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    height: 28,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  idleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  idleText: {
    fontSize: 12,
    color: '#f97316',
    letterSpacing: 0.5,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

