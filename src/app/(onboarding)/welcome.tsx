// src/app/(onboarding)/welcome.tsx — Screen 1

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TopChrome } from '@/components/top-chrome';
import { palette, primary, radii, shadows, sizes, spacing, text } from '@/theme';

const HERO_URI =
  'https://images.unsplash.com/photo-A0iyW5nsoac?w=900&q=80&fit=crop';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* No back, no step, no close — pre-onboarding chrome */}
      <TopChrome />

      <View style={styles.copy}>
        <Text style={styles.headline}>Hi Sam.</Text>
        <Text style={styles.subhead}>
          We'll go at your pace. One step at a time.
        </Text>
      </View>

      <View style={styles.heroWrapper}>
        <Image
          source={{ uri: HERO_URI }}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel="Runner silhouette at golden hour"
        />
      </View>

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
  copy: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    gap: spacing.xs,
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
    flex: 1,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  hero: {
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
