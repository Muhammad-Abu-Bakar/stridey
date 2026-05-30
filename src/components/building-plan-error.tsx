// src/components/building-plan-error.tsx
//
// Presentational error view for Screen 10 (building loader).
// Owns no state or timers — caller drives retry/fallback actions.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PathGlyph } from '@/components/path-glyph';
import { PrimaryButton } from '@/components/primary-button';
import { fonts, palette, spacing, text } from '@/theme';

type Props = {
  onRetry: () => void;
  onUseStarterPlan: () => void;
};

export function BuildingPlanError({ onRetry, onUseStarterPlan }: Props) {
  return (
    <View style={styles.root}>
      <PathGlyph name="broken-line" size={64} color={palette.textDim} />

      <Text style={styles.headline}>We hit a snag</Text>
      <Text style={styles.subhead}>
        Your answers are saved — let's try again
      </Text>

      <View style={styles.actions}>
        <PrimaryButton label="Retry" onPress={onRetry} />
        <Pressable
          onPress={onUseStarterPlan}
          style={({ pressed }) => pressed && styles.linkPressed}
          accessibilityRole="button"
          accessibilityLabel="Use a starter plan"
        >
          <Text style={styles.link}>Use a starter plan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  headline: {
    ...text.h1,
    color: palette.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subhead: {
    ...text.body,
    color: palette.textDim,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  link: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: palette.textDim,
    textAlign: 'center',
  },
  linkPressed: {
    opacity: 0.6,
  },
});
