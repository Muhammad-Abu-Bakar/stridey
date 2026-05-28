// src/app/(onboarding)/units.tsx — Screen 8

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Localization from 'expo-localization';

import { OnboardingCard } from '@/components/onboarding-card';
import { TopChrome } from '@/components/top-chrome';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { palette, spacing, text } from '@/theme';

const region = Localization.getLocales()[0]?.regionCode;
const DEFAULT_UNIT: 'mi' | 'km' =
  region && ['US', 'GB', 'LR', 'MM'].includes(region) ? 'mi' : 'km';

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
  ]);
}

export default function UnitsScreen() {
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated);
  const units       = useOnboardingStore((s) => s.units);
  const setUnits    = useOnboardingStore((s) => s.setUnits);

  if (!hasHydrated) return null;

  const selected = units ?? DEFAULT_UNIT;

  function handleSelect(u: 'mi' | 'km') {
    setUnits(u);
    router.push('/(onboarding)/plan-summary');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={8} onBack={() => router.back()} onClose={confirmQuit} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Miles or kilometres?</Text>

        <View style={styles.cards}>
          <OnboardingCard
            variant="standard"
            title="Miles"
            description="Easy run · 3 mi"
            selected={selected === 'mi'}
            onPress={() => handleSelect('mi')}
          />
          <OnboardingCard
            variant="standard"
            title="Kilometres"
            description="Easy run · 5 km"
            selected={selected === 'km'}
            onPress={() => handleSelect('km')}
          />
        </View>

        <Text style={styles.microcopy}>Change later in Settings → Units.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { flex: 1 },
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
  cards: { gap: spacing.sm },
  microcopy: {
    ...text.caption,
    color: palette.textVeryDim,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
