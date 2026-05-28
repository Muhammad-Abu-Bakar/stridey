// src/app/(onboarding)/frequency.tsx — Screen 5

import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { OnboardingCard } from '@/components/onboarding-card';
import { TopChrome } from '@/components/top-chrome';
import { WeekStrip } from '@/components/week-strip';
import { threeDayDescription } from '@/lib/onboarding/copy-by-goal';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { palette, primary, radii, shadows, sizes, spacing, text } from '@/theme';

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
  ]);
}

export default function FrequencyScreen() {
  const hasHydrated        = useOnboardingStore((s) => s.hasHydrated);
  const goal               = useOnboardingStore((s) => s.goal);
  const weeklyFrequency    = useOnboardingStore((s) => s.weeklyFrequency);
  const setWeeklyFrequency = useOnboardingStore((s) => s.setWeeklyFrequency);

  if (!hasHydrated) return null;

  const armed = weeklyFrequency !== null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={5} onBack={() => router.back()} onClose={confirmQuit} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>How often would you like to run?</Text>
        <Text style={styles.subhead}>Run most weeks. You can adjust anytime.</Text>

        <View style={styles.cards}>
          <OnboardingCard
            variant="tall"
            title="2 Days"
            description="Lighter commitment, slower ramp."
            footer={<WeekStrip filled={2} selected={weeklyFrequency === 2} />}
            selected={weeklyFrequency === 2}
            onPress={() => setWeeklyFrequency(2)}
          />
          <OnboardingCard
            variant="tall"
            title="3 Days"
            description={threeDayDescription(goal)}
            descriptionLines={2}
            tag="Most popular"
            footer={<WeekStrip filled={3} selected={weeklyFrequency === 3} />}
            selected={weeklyFrequency === 3}
            onPress={() => setWeeklyFrequency(3)}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/* TODO: extract shared Button */}
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            !armed && styles.ctaMuted,
            pressed && armed && styles.ctaPressed,
          ]}
          onPress={() => router.push('/(onboarding)/days')}
          disabled={!armed}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={[styles.ctaLabel, !armed && styles.ctaLabelMuted]}>
            Continue
          </Text>
        </Pressable>
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
  ctaPressed:     { opacity: 0.88 },
  ctaLabel:       { ...text.button, color: palette.primaryText },
  ctaLabelMuted:  { color: palette.textDim },
});
