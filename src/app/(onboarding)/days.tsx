// src/app/(onboarding)/days.tsx — Screen 6

import { useState } from 'react';
import { Alert, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TopChrome } from '@/components/top-chrome';
import { WeekStrip } from '@/components/week-strip';
import { useOnboardingStore } from '@/lib/onboarding/store';
import type { AvailableDays } from '@/lib/onboarding/store';
import { palette, primary, radii, shadows, sizes, spacing, text } from '@/theme';

const GAP = 8;
const EMPTY_DAYS: AvailableDays = [false, false, false, false, false, false, false];

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
  ]);
}

export default function DaysScreen() {
  const hasHydrated      = useOnboardingStore((s) => s.hasHydrated);
  const weeklyFrequency  = useOnboardingStore((s) => s.weeklyFrequency);
  const availableDays    = useOnboardingStore((s) => s.availableDays);
  const setAvailableDays = useOnboardingStore((s) => s.setAvailableDays);

  const [stripWidth, setStripWidth] = useState<number | null>(null);

  if (!hasHydrated) return null;

  const minDays = weeklyFrequency ?? 2;
  const days: AvailableDays = availableDays ?? EMPTY_DAYS;
  const count = days.filter(Boolean).length;
  const armed = count >= minDays;
  const remaining = minDays - count;
  const ctaLabel = armed
    ? 'Continue'
    : `Pick ${remaining} more day${remaining === 1 ? '' : 's'}`;

  function handleToggle(i: number) {
    const next = [...days];
    next[i] = !next[i];
    setAvailableDays(next as AvailableDays);
  }

  function handleLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setStripWidth(w);
  }

  const dotSize = stripWidth !== null
    ? Math.max(28, Math.min(52, Math.floor((stripWidth - GAP * 6) / 7)))
    : null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={6} onBack={() => router.back()} onClose={confirmQuit} />

      <View style={styles.content}>
        <Text style={styles.headline}>Which days are you free?</Text>

        <View style={styles.stripContainer} onLayout={handleLayout}>
          {dotSize !== null && (
            <WeekStrip
              days={days}
              onToggle={handleToggle}
              labelsInside
              dotSize={dotSize}
              gap={GAP}
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>

        <Text style={styles.counter}>{count} of 7 selected</Text>
        <Text style={styles.microcopy}>
          Spread your days across the week so your body can recover.
        </Text>
      </View>

      <View style={styles.footer}>
        {/* TODO: extract shared Button */}
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            !armed && styles.ctaMuted,
            pressed && armed && styles.ctaPressed,
          ]}
          onPress={() => router.push('/(onboarding)/start-date')}
          disabled={!armed}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          <Text style={[styles.ctaLabel, !armed && styles.ctaLabelMuted]}>
            {ctaLabel}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: palette.bg },
  content: { flex: 1, paddingHorizontal: spacing.md },
  headline: {
    ...text.h1,
    color: palette.text,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  stripContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  counter: {
    ...text.caption,
    color: palette.counter,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  microcopy: {
    ...text.caption,
    color: palette.textVeryDim,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  cta: {
    height: sizes.buttonHeight,
    backgroundColor: primary,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryButton,
  },
  ctaMuted: {
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaPressed:    { opacity: 0.88 },
  ctaLabel:      { ...text.button, color: palette.primaryText },
  ctaLabelMuted: { color: palette.textDim },
});
