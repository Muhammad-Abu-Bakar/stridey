import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationBanner } from '@/components/location-banner';
import { WeekStrip } from '@/components/week-strip';
import { fromISO, toISO, formatPretty, formatShort } from '@/lib/dates';
import { Phase, planProgress } from '@/lib/plan/plan-progress';
import { useActivePlan } from '@/lib/plan/use-active-plan';
import { useLocationPermission } from '@/lib/permissions/use-location-permission';
import { palette, primary, radii, spacing, text } from '@/theme';

function leftLabel(phase: Phase, start: Date): string {
  return phase === 'pre' ? `Starts ${formatShort(start)}` : `Started ${formatShort(start)}`;
}

function rightLabel(phase: Phase, weeksToGo: number): string {
  if (weeksToGo > 0) return weeksToGo === 1 ? '1 week to go' : `${weeksToGo} weeks to go`;
  if (phase === 'active') return 'Final week';
  return 'Plan complete';
}

export default function HomeScreen() {
  const state = useActivePlan();
  const { granted, fix } = useLocationPermission();

  if (state.kind === 'loading') {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={primary} style={styles.centered} />
      </SafeAreaView>
    );
  }

  if (state.kind === 'error') {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={[styles.centered, text.body, { color: palette.text }]}>
          Couldn't load your plan.
        </Text>
      </SafeAreaView>
    );
  }

  if (state.kind === 'no-plan') {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={[styles.centered, text.body, { color: palette.textDim }]}>
          No active plan yet.
        </Text>
      </SafeAreaView>
    );
  }

  const { plan } = state;
  const today = fromISO(toISO(new Date()));
  const start = fromISO(plan.startDate);
  const end = fromISO(plan.endDate);
  const { phase, currentWeek, weeksToGo, progress } = planProgress(plan.startDate, plan.weeks, today);

  const subtitle =
    phase === 'active'
      ? `Week ${currentWeek} of ${plan.weeks} · ${formatShort(start)} – ${formatShort(end)}`
      : phase === 'pre'
      ? `Starts ${formatPretty(start)}`
      : `Plan complete · ${formatShort(start)} – ${formatShort(end)}`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {!granted && <LocationBanner onPress={fix} />}

        <Text style={styles.eyebrow}>ACTIVE PLAN</Text>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PLAN PROGRESS</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{leftLabel(phase, start)}</Text>
            <Text style={styles.progressText}>{rightLabel(phase, weeksToGo)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>YOUR TRAINING DAYS</Text>
        <WeekStrip days={plan.availableDays} selected showLabels />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  centered: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  eyebrow: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    ...text.h1,
    color: palette.text,
    marginTop: spacing.xxs,
  },
  subtitle: {
    ...text.body,
    color: palette.textDim,
  },
  card: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.cardBg,
    gap: spacing.xs,
  },
  cardLabel: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: primary,
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    ...text.caption,
    color: palette.textDim,
  },
  sectionLabel: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
});
