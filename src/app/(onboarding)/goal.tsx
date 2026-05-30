// src/app/(onboarding)/goal.tsx — Screen 2

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { OnboardingCard } from '@/components/onboarding-card';
import { TopChrome } from '@/components/top-chrome';
import { type Goal, useOnboardingStore } from '@/lib/onboarding/store';
import { palette, primary, spacing, text } from '@/theme';

const GOAL_OPTIONS: Array<{
  goal: Goal;
  title: string;
  description?: string;
}> = [
  { goal: 'first-5k', title: 'Run my first 5K', description: 'New to running' },
  {
    goal: 'faster-5k',
    title: 'Run a faster 5K',
    description: 'You can run 5K — want to be quicker',
  },
  {
    goal: 'build-10k',
    title: 'Build to 10K',
    description: 'Comfortable at 5K, going further',
  },
  {
    goal: 'general-fitness',
    title: 'General fitness',
    description: 'No goal — just keep running',
  },
  { goal: 'help-me-choose', title: 'Help me choose' },
];

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Quit',
      style: 'destructive',
      onPress: () => router.replace('/home'),
    },
  ]);
}

export default function GoalScreen() {
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated);
  const goal = useOnboardingStore((s) => s.goal);
  const setGoal = useOnboardingStore((s) => s.setGoal);

  if (!hasHydrated) return null;

  function handleSelect(selected: Goal) {
    setGoal(selected);
    router.push('/(onboarding)/ability');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={2} onBack={() => router.back()} onClose={confirmQuit} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>What's your goal?</Text>

        <View style={styles.cards}>
          {GOAL_OPTIONS.map((option) => (
            <OnboardingCard
              key={option.goal}
              title={option.title}
              description={option.description}
              leading={
                option.goal === 'help-me-choose' ? (
                  <Feather
                    name="compass"
                    size={20}
                    color={goal === 'help-me-choose' ? primary : palette.textDim}
                  />
                ) : undefined
              }
              selected={goal === option.goal}
              onPress={() => handleSelect(option.goal)}
            />
          ))}
        </View>

        <Text style={styles.microcopy}>
          You can change your goal later in settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headline: {
    ...text.h1,
    color: palette.text,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  cards: {
    gap: spacing.sm,
  },
  microcopy: {
    ...text.caption,
    color: palette.textVeryDim,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
