import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeekStrip } from '@/components/week-strip';
import { addDays, formatPretty, formatShort, fromISO, toISO } from '@/lib/dates';
import { planProgress } from '@/lib/plan/plan-progress';
import { useActivePlan } from '@/lib/plan/use-active-plan';
import { fonts, palette, primary, radii, spacing, text } from '@/theme';

export default function PlanScreen() {
  const state = useActivePlan();

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
  const { phase, currentWeek } = planProgress(plan.startDate, plan.weeks, today);
  const focusWeek = Math.max(1, currentWeek);

  const headerSubtitle =
    phase === 'active'
      ? `Week ${currentWeek} of ${plan.weeks} · ends ${formatShort(end)}`
      : phase === 'pre'
      ? `Starts ${formatPretty(start)}`
      : `Plan complete · ends ${formatShort(end)}`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.screenTitle}>Your Plan</Text>

        <View style={styles.headerCard}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planSubtitle}>{headerSubtitle}</Text>
        </View>

        <Text style={styles.sectionLabel}>WEEKS</Text>

        {Array.from({ length: plan.weeks }, (_, i) => {
          const n = i + 1;
          const weekStart = addDays(start, 7 * (n - 1));
          const weekEnd = addDays(start, 7 * (n - 1) + 6);
          const isFocus = n === focusWeek;

          return (
            <View key={n} style={[styles.weekCard, isFocus && styles.weekCardFocus]}>
              <Text style={[styles.weekLabel, isFocus && styles.weekLabelFocus]}>
                Week {n}
              </Text>
              <Text style={styles.weekRange}>
                {formatShort(weekStart)} – {formatShort(weekEnd)}
              </Text>
              {isFocus && (
                <View style={styles.strip}>
                  <WeekStrip days={plan.availableDays} selected showLabels />
                </View>
              )}
            </View>
          );
        })}

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
  screenTitle: {
    ...text.h1,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  headerCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.cardBg,
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  planTitle: {
    ...text.body,
    color: palette.text,
    fontWeight: '600',
  },
  planSubtitle: {
    ...text.body,
    color: palette.textDim,
  },
  sectionLabel: {
    ...text.caption,
    color: palette.textVeryDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  weekCard: {
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: palette.cardBg,
    marginBottom: spacing.xs,
  },
  weekCardFocus: {
    borderWidth: 1,
    borderColor: primary,
  },
  weekLabel: {
    ...text.body,
    color: palette.text,
  },
  weekLabelFocus: {
    fontWeight: '600',
  },
  weekRange: {
    ...text.caption,
    color: palette.textDim,
  },
  strip: {
    marginTop: spacing.sm,
  },
});
