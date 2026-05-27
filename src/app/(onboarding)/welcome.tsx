// src/app/(onboarding)/welcome.tsx — Screen 1

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TopChrome } from '@/components/top-chrome';
import { palette, primary, radii, shadows, sizes, spacing, text } from '@/theme';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* No back, no step, no close — pre-onboarding chrome */}
      <TopChrome />

      <View style={styles.wordmark}>
        <View style={styles.wordmarkDot} />
        <Text style={styles.wordmarkText}>Stridey</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.headline}>Hi Sam.</Text>
        <Text style={styles.subhead}>
          We'll go at your pace. One step at a time.
        </Text>
      </View>

      <View style={styles.heroWrapper}>
        <Image
          source={require('../../../assets/images/welcome-hero.jpg')}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel="Runner silhouette at golden hour"
        />
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => router.push('/(onboarding)/goal')}
          accessibilityRole="button"
          accessibilityLabel="Get started"
        >
          <Text style={styles.ctaLabel}>Get started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  wordmarkDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: primary,
  },
  wordmarkText: {
    ...text.brand,
    color: palette.text,
  },
  copy: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  headline: {
    ...text.h1,
    color: palette.text,
  },
  subhead: {
    ...text.body,
    color: palette.textDim,
  },
  heroWrapper: {
    marginHorizontal: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    aspectRatio: 0.85,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  spacer: {
    flex: 1,
  },
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
  ctaPressed: {
    opacity: 0.88,
  },
  ctaLabel: {
    ...text.button,
    color: palette.primaryText,
  },
});
