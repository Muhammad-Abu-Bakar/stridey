// src/app/(onboarding)/start-date.tsx — Screen 7 (stub)

import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TopChrome } from '@/components/top-chrome';
import { palette, spacing, text } from '@/theme';

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
  ]);
}

export default function StartDateScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={7} onBack={() => router.back()} onClose={confirmQuit} />
      <View style={styles.center}>
        <Text style={styles.label}>Start date — TODO</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: palette.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  label:  { ...text.body, color: palette.textDim },
});
