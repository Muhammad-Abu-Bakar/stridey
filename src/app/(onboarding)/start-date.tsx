// src/app/(onboarding)/start-date.tsx — Screen 7

import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { OnboardingCard } from '@/components/onboarding-card';
import { PrimaryButton } from '@/components/primary-button';
import { TopChrome } from '@/components/top-chrome';
import { planWeeks } from '@/lib/onboarding/plan-duration';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { palette, spacing, text } from '@/theme';

// ─── Date helpers (local-time only — no UTC conversions) ─────────────

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function formatPretty(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// ─────────────────────────────────────────────────────────────────────

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
  ]);
}

export default function StartDateScreen() {
  const hasHydrated    = useOnboardingStore((s) => s.hasHydrated);
  const goal           = useOnboardingStore((s) => s.goal);
  const weeklyFrequency = useOnboardingStore((s) => s.weeklyFrequency);
  const startDate      = useOnboardingStore((s) => s.startDate);
  const setStartDate   = useOnboardingStore((s) => s.setStartDate);

  const [showPicker, setShowPicker] = useState(false);

  if (!hasHydrated) return null;

  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayISO  = toISO(today);
  const tomorrow  = addDays(today, 1);
  const tomorrowISO = toISO(tomorrow);

  const selectedISO = startDate ?? tomorrowISO;
  const isCustom    = selectedISO !== todayISO && selectedISO !== tomorrowISO;

  const planEndISO =
    goal && weeklyFrequency
      ? toISO(addDays(fromISO(selectedISO), planWeeks(goal, weeklyFrequency) * 7 - 1))
      : null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={7} onBack={() => router.back()} onClose={confirmQuit} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>When should we begin?</Text>
        <Text style={styles.subhead}>You can change this anytime.</Text>

        <View style={styles.cards}>
          <OnboardingCard
            variant="standard"
            title="Today"
            description={formatPretty(today)}
            selected={selectedISO === todayISO}
            onPress={() => setStartDate(todayISO)}
          />
          <OnboardingCard
            variant="standard"
            title="Tomorrow"
            description={formatPretty(tomorrow)}
            tag="Recommended"
            selected={selectedISO === tomorrowISO}
            onPress={() => setStartDate(tomorrowISO)}
          />
          <OnboardingCard
            variant="standard"
            title="Pick a date"
            description={isCustom ? formatPretty(fromISO(selectedISO)) : 'Tap to choose'}
            selected={isCustom}
            onPress={() => setShowPicker(true)}
          />
        </View>

        {planEndISO !== null && (
          <Animated.View entering={FadeIn.duration(200)} key={planEndISO} style={styles.planEnds}>
            <Text style={styles.planEndsText}>Plan ends {formatPretty(fromISO(planEndISO))}.</Text>
          </Animated.View>
        )}

        {showPicker && (
          <DateTimePicker
            value={fromISO(selectedISO)}
            mode="date"
            minimumDate={today}
            onChange={(event, date) => {
              setShowPicker(false);
              if (event.type === 'set' && date) setStartDate(toISO(date));
            }}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => {
            setStartDate(selectedISO);
            router.push('/(onboarding)/units');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: palette.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  headline: {
    ...text.h1,
    color: palette.text,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subhead: {
    ...text.body,
    color: palette.textDim,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  cards: { gap: spacing.sm },
  planEnds: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  planEndsText: {
    ...text.caption,
    color: palette.textDim,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
