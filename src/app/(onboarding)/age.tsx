// src/app/(onboarding)/age.tsx — Screen 4

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { OnboardingCard } from '@/components/onboarding-card';
import { TopChrome } from '@/components/top-chrome';
import { type AgeBucket, useOnboardingStore } from '@/lib/onboarding/store';
import { palette, spacing, text } from '@/theme';

type AgeOption = {
  key: string;
  storeValue: AgeBucket;
  title: string;
  description: string;
};

const AGE_OPTIONS: AgeOption[] = [
  { key: 'teens',      storeValue: 1, title: 'Teens',      description: '13–19' },
  { key: 'twenties',   storeValue: 2, title: 'Twenties',   description: '20–29' },
  { key: 'thirties',   storeValue: 3, title: 'Thirties',   description: '30–39' },
  { key: 'forties',    storeValue: 4, title: 'Forties',    description: '40–49' },
  { key: 'fifty-plus', storeValue: 5, title: 'Fifty plus', description: '50+' },
];

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Quit',
      style: 'destructive',
      onPress: () => router.replace('/(tabs)'),
    },
  ]);
}

export default function AgeScreen() {
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated);
  const ageBucket = useOnboardingStore((s) => s.ageBucket);
  const setAgeBucket = useOnboardingStore((s) => s.setAgeBucket);

  if (!hasHydrated) return null;

  function handleSelect(option: AgeOption) {
    setAgeBucket(option.storeValue);
    router.push('/(onboarding)/frequency');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={4} onBack={() => router.back()} onClose={confirmQuit} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Roughly how old are you?</Text>
        <Text style={styles.subhead}>
          We use this to set a safe starting intensity — beginner plans look
          different at 25 than at 55.
        </Text>

        <View style={styles.cards}>
          {AGE_OPTIONS.map((option) => (
            <OnboardingCard
              key={option.key}
              title={option.title}
              description={option.description}
              selected={ageBucket === option.storeValue}
              onPress={() => handleSelect(option)}
            />
          ))}
        </View>

        <View style={styles.privacyBlock}>
          <Text style={styles.microcopy}>
            Used only to set your starting intensity. Stays on this device —
            never uploaded.
          </Text>
          <Text style={styles.microcopy}>Stridey is for ages 13 and up.</Text>
        </View>
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
    marginBottom: spacing.sm,
  },
  subhead: {
    ...text.body,
    color: palette.textDim,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  cards: {
    gap: spacing.sm,
  },
  privacyBlock: {
    marginTop: spacing.xl,
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  microcopy: {
    ...text.caption,
    color: palette.textVeryDim,
    textAlign: 'center',
  },
});
