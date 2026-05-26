// src/components/top-chrome.tsx
//
// Top chrome for onboarding screens.
//
// - Back arrow (left)   — hidden when onBack is omitted
// - Progress bar (mid)  — hidden when step is omitted (welcome / pre-onboarding)
// - Close X (right)     — hidden when onClose is omitted
//
// Close-X confirmation modal ("Quit setup? Your progress will be saved.") is
// the parent screen's responsibility, per docs/design-decisions.md. TopChrome
// just calls onClose and lets the parent decide what to do.

import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { motion, palette, primary, spacing } from '@/theme';

export type TopChromeProps = {
  step?: number;          // 1..totalSteps. Omit on welcome / pre-onboarding.
  totalSteps?: number;    // default 12
  onBack?: () => void;    // omit to hide back arrow
  onClose?: () => void;   // omit to hide close X
};

const HIT_SIZE = 44;
const ICON_SIZE = 24;
const TRACK_HEIGHT = 4;

export function TopChrome({
  step,
  totalSteps = 12,
  onBack,
  onClose,
}: TopChromeProps) {
  const progress = useRef(
    new Animated.Value(step !== undefined ? step / totalSteps : 0),
  ).current;

  useEffect(() => {
    if (step === undefined) return;
    Animated.timing(progress, {
      toValue: step / totalSteps,
      duration: motion.base,
      useNativeDriver: false, // width animation can't run on native driver
    }).start();
  }, [step, totalSteps, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={({ pressed }) => [styles.hit, pressed && styles.hitPressed]}
        >
          <Feather name="arrow-left" size={ICON_SIZE} color={palette.text} />
        </Pressable>
      ) : (
        <View style={styles.hit} />
      )}

      <View style={styles.progressContainer}>
        {step !== undefined ? (
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityLabel="Onboarding progress"
            accessibilityValue={{ min: 0, max: totalSteps, now: step }}
          >
            <Animated.View style={[styles.fill, { width: fillWidth }]} />
          </View>
        ) : null}
      </View>

      {onClose ? (
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={({ pressed }) => [styles.hit, pressed && styles.hitPressed]}
        >
          <Feather name="x" size={ICON_SIZE} color={palette.text} />
        </Pressable>
      ) : (
        <View style={styles.hit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  hit: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitPressed: {
    opacity: 0.7,
  },
  progressContainer: {
    flex: 1,
    height: HIT_SIZE,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: palette.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: primary,
    borderRadius: TRACK_HEIGHT / 2,
  },
});
