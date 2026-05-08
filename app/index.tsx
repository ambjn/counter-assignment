import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonRow } from '../components/ButtonRow';
import { CounterDisplay } from '../components/CounterDisplay';
import { useCounter } from '../hooks/useCounter';

const CounterScreen = () => {
  const {
    count,
    increment,
    decrement,
    reset,
    history,
    clearHistory,
    startLongPress,
    stopLongPress,
    incrementProgress,
    isIdle,
  } = useCounter();

  const [historyVisible, setHistoryVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleClearHistory = () => {
    clearHistory();
    setHistoryVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.main}>
        <Text style={styles.title}>
          COUNTER
        </Text>

        <Animated.View entering={FadeIn.delay(200).duration(800)}>
          <CounterDisplay
            count={count}
            incrementProgress={incrementProgress}
            isIdle={isIdle}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(800)}>
          <ButtonRow
            onIncrement={increment}
            onDecrement={decrement}
            onReset={reset}
            onIncrementLongPress={startLongPress}
            onIncrementPressOut={stopLongPress}
          />
        </Animated.View>
      </View>

      <View style={styles.historyTriggerWrapper}>
        <Pressable
          style={({ pressed }) => [styles.historyTrigger, pressed && styles.historyTriggerPressed]}
          onPress={() => setHistoryVisible(true)}
        >
          <Feather name="clock" size={12} color="#525252" />
          <Text style={styles.historyTriggerText}>
            {history.length} {history.length === 1 ? 'value' : 'values'}
          </Text>
          <Feather name="chevron-up" size={12} color="#525252" />
        </Pressable>
      </View>

      {/* // history modal */}

      <Modal
        visible={historyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setHistoryVisible(false)} />

          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>history</Text>
              <Pressable
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}
                onPress={() => setHistoryVisible(false)}
              >
                <Feather name="x" size={16} color="#525252" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <FlatList
              data={history}
              keyExtractor={(_, i) => String(i)}
              style={styles.list}
              scrollEnabled={history.length > 5}
              renderItem={({ item, index }) => (
                <View style={[styles.listItem, index < history.length - 1 && styles.listItemBorder]}>
                  <Text style={styles.listIndex}>#{index + 1}</Text>
                  <Text style={styles.listValue}>{item}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [styles.clearBtn, pressed && styles.clearBtnPressed]}
              onPress={handleClearHistory}
            >
              <Feather name="trash-2" size={14} color="#f97316" />
              <Text style={styles.clearBtnText}>clear history</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#525252',
    letterSpacing: 4,
    marginBottom: 40,
  },
  historyTriggerWrapper: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  historyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  historyTriggerPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  historyTriggerText: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  sheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 0,
  },
  list: {
    maxHeight: 280,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  listIndex: {
    fontSize: 12,
    color: '#3f3f3f',
    fontWeight: '500',
    letterSpacing: 0.5,
    width: 32,
  },
  listValue: {
    fontSize: 22,
    fontWeight: '300',
    color: '#d4d4d4',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(249,115,22,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  clearBtnPressed: {
    backgroundColor: 'rgba(249,115,22,0.14)',
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f97316',
    letterSpacing: 0.3,
  },
});

export default CounterScreen;
