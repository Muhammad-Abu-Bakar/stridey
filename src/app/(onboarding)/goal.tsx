// src/app/(onboarding)/goal.tsx — Screen 2 (stub)

import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopChrome } from '@/components/top-chrome';
import { palette, spacing, text } from '@/theme';

export default function GoalScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={2} />
      <View style={styles.center}>
        <Text style={styles.label}>Goal screen — TODO</Text>
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
