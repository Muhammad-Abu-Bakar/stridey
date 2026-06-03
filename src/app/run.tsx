import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { useRunRecorder } from '@/lib/runs/use-run-recorder';
import { palette, primary, fonts, spacing, radii, text } from '@/theme';

function formatDuration(totalS: number): string {
  const h = Math.floor(totalS / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = Math.floor(totalS % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatPace(secPerKm: number | null): string {
  if (secPerKm == null) return '--:--';
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDistanceKm(m: number): string {
  return (m / 1000).toFixed(2);
}

export default function RunScreen() {
  useKeepAwake();
  const run = useRunRecorder();

  async function onStart() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      Alert.alert('Location needed', 'Enable location access to record a run.');
      return;
    }
    await run.start();
  }

  async function onFinish() {
    const summary = await run.stop();
    console.log('[run] summary', summary);
  }

  function onCancel() {
    if (run.state === 'running' || run.state === 'paused') {
      Alert.alert('Discard run?', "This run won't be saved.", [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try { await run.stop(); } catch {}
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <View style={styles.container}>
          {/* Top row */}
          <Pressable onPress={onCancel} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          {/* Middle: stats */}
          <View style={styles.middle}>
            <Text style={styles.duration}>{formatDuration(run.durationS)}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statValue}>{formatDistanceKm(run.distanceM)}</Text>
                <Text style={styles.statLabel}>km</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statValue}>{formatPace(run.paceSecPerKm)}</Text>
                <Text style={styles.statLabel}>/km</Text>
              </View>
            </View>
          </View>

          {/* Bottom controls */}
          <View>
            {run.state === 'idle' && (
              <Pressable
                onPress={onStart}
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
              >
                <Text style={styles.btnPrimaryText}>Start</Text>
              </Pressable>
            )}

            {run.state === 'running' && (
              <View style={styles.btnRow}>
                <Pressable
                  onPress={run.pause}
                  style={({ pressed }) => [styles.btnOutline, styles.flexFill, pressed && styles.pressed]}
                >
                  <Text style={styles.btnOutlineText}>Pause</Text>
                </Pressable>
                <Pressable
                  onPress={onFinish}
                  style={({ pressed }) => [styles.btnPrimary, styles.flexFill, pressed && styles.pressed]}
                >
                  <Text style={styles.btnPrimaryText}>Finish</Text>
                </Pressable>
              </View>
            )}

            {run.state === 'paused' && (
              <View style={styles.btnRow}>
                <Pressable
                  onPress={run.resume}
                  style={({ pressed }) => [styles.btnPrimary, styles.flexFill, pressed && styles.pressed]}
                >
                  <Text style={styles.btnPrimaryText}>Resume</Text>
                </Pressable>
                <Pressable
                  onPress={onFinish}
                  style={({ pressed }) => [styles.btnOutline, styles.flexFill, pressed && styles.pressed]}
                >
                  <Text style={styles.btnOutlineText}>Finish</Text>
                </Pressable>
              </View>
            )}

            {run.state === 'finished' && (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
              >
                <Text style={styles.btnPrimaryText}>Done</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  closeBtn: {
    alignSelf: 'flex-start',
  },
  closeText: {
    fontSize: 24,
    color: palette.textDim,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: palette.text,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.xxl,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 28,
    color: palette.text,
  },
  statLabel: {
    ...text.caption,
    color: palette.textDim,
    marginTop: spacing.xxs,
  },
  btnPrimary: {
    backgroundColor: primary,
    borderRadius: radii.pill,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontFamily: fonts.displaySemiBold,
    color: palette.primaryText,
    fontSize: 16,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: primary,
    backgroundColor: 'transparent',
    borderRadius: radii.pill,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexFill: {
    flex: 1,
  },
  btnOutlineText: {
    fontFamily: fonts.displaySemiBold,
    color: primary,
    fontSize: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
});
