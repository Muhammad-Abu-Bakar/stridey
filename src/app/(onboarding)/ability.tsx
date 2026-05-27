// src/app/(onboarding)/ability.tsx — Screen 3

import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { OnboardingCard } from '@/components/onboarding-card';
import { PathGlyph, type GlyphName } from '@/components/path-glyph';
import { TopChrome } from '@/components/top-chrome';
import { type StartingPoint, useOnboardingStore } from '@/lib/onboarding/store';
import { palette, primary, spacing, text } from '@/theme';

type AbilityOption = {
  key: string;
  storeValue: StartingPoint;
  title: string;
  glyph: GlyphName;
  dimmed?: boolean;
};

const ABILITY_OPTIONS: AbilityOption[] = [
  {
    key: 'not-running',
    storeValue: 0,
    title: "I'd like to start, but I'm not running yet.",
    glyph: 'dot-start',
  },
  {
    key: 'jog-walk',
    storeValue: 1,
    title: 'I can jog a bit, then I need to walk to catch my breath.',
    glyph: 'dashed-broken',
  },
  {
    key: 'three-k',
    storeValue: 2,
    title: 'I can run about 3K (2 miles) without stopping.',
    glyph: 'smooth-curve',
  },
  {
    key: 'ten-k',
    storeValue: 3,
    title: 'I run regularly — 8–10K (5–6 miles) feels comfortable.',
    glyph: 'hill-curve',
  },
  {
    key: 'not-sure',
    storeValue: 1, // same as jog-walk — safest default per store.ts
    title: "Not sure yet — I'll figure it out.",
    glyph: 'faint-dotted',
    dimmed: true,
  },
];

// For value=1, prefer the non-dimmed card on back-navigation so only
// one card highlights. Minor v1 imprecision: user who chose "not sure"
// sees "jog-walk" highlighted on return — functionally equivalent.
function deriveSelectedKey(sp: StartingPoint | null): string | null {
  if (sp === null) return null;
  return (
    ABILITY_OPTIONS.find((o) => o.storeValue === sp && !o.dimmed) ??
    ABILITY_OPTIONS.find((o) => o.storeValue === sp)
  )?.key ?? null;
}

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

export default function AbilityScreen() {
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated);
  const startingPoint = useOnboardingStore((s) => s.startingPoint);
  const setStartingPoint = useOnboardingStore((s) => s.setStartingPoint);

  // Local key tracks which card is visually selected. Initialises to null;
  // synced from store after hydration so back-navigation restores selection.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && startingPoint !== null) {
      setSelectedKey((prev) => prev ?? deriveSelectedKey(startingPoint));
    }
  }, [hasHydrated, startingPoint]);

  if (!hasHydrated) return null;

  function handleSelect(option: AbilityOption) {
    setSelectedKey(option.key);
    setStartingPoint(option.storeValue);
    router.push('/(onboarding)/age');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={3} onBack={() => router.back()} onClose={confirmQuit} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>
          Which sounds most like you right now?
        </Text>

        <View style={styles.cards}>
          {ABILITY_OPTIONS.map((option) => (
            <View
              key={option.key}
              style={option.dimmed ? styles.dimmed : undefined}
            >
              <OnboardingCard
                variant="tall"
                title={option.title}
                leading={
                  <PathGlyph
                    name={option.glyph}
                    size={24}
                    color={selectedKey === option.key ? primary : palette.textDim}
                  />
                }
                selected={selectedKey === option.key}
                onPress={() => handleSelect(option)}
              />
            </View>
          ))}
        </View>

        <Text style={styles.microcopy}>You can change this later.</Text>
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
  dimmed: {
    opacity: 0.6,
  },
  microcopy: {
    ...text.caption,
    color: palette.textVeryDim,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
