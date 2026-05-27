// src/app/(onboarding)/ability.tsx — Screen 3 (stub)

import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TopChrome } from '@/components/top-chrome';
import { palette, spacing, text } from '@/theme';

export default function AbilityScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={3} onBack={() => router.back()} onClose={() => {}} />
      <View style={styles.center}>
        <Text style={styles.label}>Ability screen — TODO</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  label: {
    ...text.body,
    color: palette.textDim,
  },
});
