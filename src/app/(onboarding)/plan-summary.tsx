// src/app/(onboarding)/plan-summary.tsx — Screen 9

import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TopChrome } from '@/components/top-chrome';
import { PrimaryButton } from '@/components/primary-button';
import { WeekStrip } from '@/components/week-strip';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { planName, planWeeks, planSessions, planSessionMinutes } from '@/lib/onboarding/plan-duration';
import { fromISO, addDays, formatPretty } from '@/lib/dates';
import { palette, radii, sizes, spacing, text } from '@/theme';

const GAP = 6;

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
  ]);
}

export default function PlanSummaryScreen() {
  const hasHydrated     = useOnboardingStore((s) => s.hasHydrated);
  const goal            = useOnboardingStore((s) => s.goal);
  const weeklyFrequency = useOnboardingStore((s) => s.weeklyFrequency);
  const availableDays   = useOnboardingStore((s) => s.availableDays);
  const startDate       = useOnboardingStore((s) => s.startDate);
  const units           = useOnboardingStore((s) => s.units);

  const [stripWidth, setStripWidth] = useState<number | null>(null);

  if (!hasHydrated) return null;
  if (!goal || !weeklyFrequency || !availableDays || !startDate || !units) return null;

  const name       = planName(goal);
  const weeks      = planWeeks(goal, weeklyFrequency);
  const sessions   = planSessions(goal);
  const minutes    = planSessionMinutes(goal);
  const start      = fromISO(startDate);
  const end        = addDays(start, weeks * 7 - 1);
  const startStr   = formatPretty(start);
  const endStr     = formatPretty(end);
  const unitsLabel = units === 'mi' ? 'Miles' : 'Kilometres';

  const handleLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    setStripWidth(e.nativeEvent.layout.width);
  };

  const dotSize = stripWidth !== null
    ? Math.max(28, Math.min(sizes.weekStripDotInteractive, Math.floor((stripWidth - GAP * 6) / 7)))
    : null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={9} onBack={() => router.back()} onClose={confirmQuit} />

      <View style={styles.heroFrame}>
        <Image
          source={require('../../../assets/images/hero_screen.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.planName}>{name}</Text>
      <Text style={styles.duration}>{weeks} weeks · {startStr} → {endStr}</Text>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{sessions}</Text>
            <Text style={styles.statLabel}>SESSIONS</Text>
          </View>
          <View style={[styles.statCol, styles.statColDivider]}>
            <Text style={styles.statValue}>{minutes} min</Text>
            <Text style={styles.statLabel}>PER SESSION</Text>
          </View>
          <View style={[styles.statCol, styles.statColDivider]}>
            <Text style={styles.statValue}>{unitsLabel}</Text>
            <Text style={styles.statLabel}>UNITS</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.weekLabel}>WHEN YOU'RE FREE</Text>

        <View style={styles.weekStripWrapper} onLayout={handleLayout}>
          {dotSize !== null && (
            <WeekStrip
              days={availableDays}
              labelsInside
              dayNamesBelow
              selected
              dotSize={dotSize}
              gap={GAP}
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <PrimaryButton
          label="Build my plan"
          onPress={() => router.push('/(onboarding)/building-plan')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  heroFrame: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  planName: {
    ...text.h1,
    color: palette.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  duration: {
    ...text.body,
    color: palette.textDim,
    marginHorizontal: spacing.md,
  },
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.cardBg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statColDivider: {
    borderLeftWidth: 1,
    borderLeftColor: palette.border,
  },
  statValue: {
    ...text.h1,
    color: palette.text,
  },
  statLabel: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    marginTop: spacing.xxs,
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm,
  },
  weekLabel: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  weekStripWrapper: {
    alignSelf: 'stretch',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
