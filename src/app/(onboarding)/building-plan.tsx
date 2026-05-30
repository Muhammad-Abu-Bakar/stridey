// src/app/(onboarding)/building-plan.tsx — Screen 10

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';

import { BuildingPlanError } from '@/components/building-plan-error';
import { TopChrome } from '@/components/top-chrome';
import { WeekStrip } from '@/components/week-strip';
import type { DotFillState } from '@/components/week-strip';
import { resolvePlanTemplate } from '@/lib/onboarding/resolve-plan-template';
import {
  useGoal,
  useWeeklyFrequency,
  useAvailableDays,
  useOnboardingStore,
} from '@/lib/onboarding/store';
import { palette, spacing, text } from '@/theme';

// ─── Constants ────────────────────────────────────────────────────────

const HEADLINES = [
  'Mapping your week',
  'Choosing your sessions',
  'Calibrating to your pace',
];
const PHASE_MS = 900;
const ANIM_TOTAL_MS = PHASE_MS * 3;  // 2700
const ERROR_TIMEOUT_MS = 6000;

// TODO: confirm screen-11 filename once account-create screen is built; remove cast then
const NEXT_ROUTE = '/(onboarding)/account-create' as Href;

// ─── Helpers ──────────────────────────────────────────────────────────

function confirmQuit() {
  Alert.alert('Quit setup?', 'Your progress will be saved.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Quit', style: 'destructive', onPress: () => router.replace('/home') },
  ]);
}

function makeFillStates(
  filledCount: number,
  userDays: number[],
  sequence: number[],
): readonly DotFillState[] {
  const states: DotFillState[] = ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
  for (let p = 0; p < filledCount && p < sequence.length; p++) {
    states[sequence[p]] = p < userDays.length ? 'user' : 'filler';
  }
  return states;
}

// ─── Screen ───────────────────────────────────────────────────────────

export default function BuildingPlanScreen() {
  const goal            = useGoal();
  const weeklyFrequency = useWeeklyFrequency();
  const availableDays   = useAvailableDays();
  const setTemplateId   = useOnboardingStore((s) => s.setTemplateId);

  const [status, setStatus]           = useState<'loading' | 'error'>('loading');
  const [phase, setPhase]             = useState<0 | 1 | 2>(0);
  const [filledCount, setFilledCount] = useState(0);

  // Refs — avoid stale-closure bugs in timer callbacks
  const mounted     = useRef(true);
  const timers      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const readDone    = useRef(false);
  const animDone    = useRef(false);
  const resolvedId  = useRef<string | null>(null);
  // status ref mirrors state so tryFinish() doesn't capture a stale value
  const statusRef   = useRef<'loading' | 'error'>('loading');

  // Fill sequence: user days (ascending index) first, then remaining
  const userDays = availableDays
    ? availableDays.flatMap((on, i) => (on ? [i] : []))
    : [];
  const remainder = [0, 1, 2, 3, 4, 5, 6].filter((i) => !userDays.includes(i));
  const sequence  = [...userDays, ...remainder];

  const fillStates = makeFillStates(filledCount, userDays, sequence);

  // Headline cross-fade
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevPhase = useRef(0);

  useEffect(() => {
    if (phase === prevPhase.current) return;
    prevPhase.current = phase;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [phase, fadeAnim]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  const tryFinish = useCallback(() => {
    if (
      readDone.current &&
      animDone.current &&
      statusRef.current === 'loading' &&
      mounted.current
    ) {
      setTemplateId(resolvedId.current);
      router.push(NEXT_ROUTE);
    }
  }, [setTemplateId]);

  const runBuild = useCallback(() => {
    if (goal == null || weeklyFrequency == null) {
      setStatus('error');
      statusRef.current = 'error';
      return;
    }

    clearTimers();
    setPhase(0);
    setFilledCount(0);
    setStatus('loading');
    statusRef.current = 'loading';
    readDone.current  = false;
    animDone.current  = false;

    // Network read
    resolvePlanTemplate(goal, weeklyFrequency).then(
      (id) => {
        resolvedId.current = id;
        readDone.current   = true;
        tryFinish();
      },
      () => {
        if (mounted.current) {
          setStatus('error');
          statusRef.current = 'error';
        }
      },
    );

    // Phase transitions
    timers.current.push(setTimeout(() => { if (mounted.current) setPhase(1); }, PHASE_MS));
    timers.current.push(setTimeout(() => { if (mounted.current) setPhase(2); }, PHASE_MS * 2));

    // Dot fill — spread filledCount increments across ANIM_TOTAL_MS
    for (let k = 0; k < sequence.length; k++) {
      const delay = Math.round((k + 1) * ANIM_TOTAL_MS / sequence.length);
      const count = k + 1;
      timers.current.push(
        setTimeout(() => { if (mounted.current) setFilledCount(count); }, delay),
      );
    }

    // Animation complete — gate navigation
    timers.current.push(
      setTimeout(() => {
        animDone.current = true;
        tryFinish();
      }, ANIM_TOTAL_MS),
    );

    // Hard error timeout — if read hasn't returned by 6s
    timers.current.push(
      setTimeout(() => {
        if (!readDone.current && mounted.current) {
          setStatus('error');
          statusRef.current = 'error';
        }
      }, ERROR_TIMEOUT_MS),
    );
  }, [goal, weeklyFrequency, sequence.length, tryFinish]);

  useEffect(() => {
    mounted.current = true;
    runBuild();
    return () => {
      mounted.current = false;
      clearTimers();
    };
    // runBuild is stable for the lifetime of the component — only re-run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUseStarterPlan() {
    // Screen 12 must treat a null templateId as "resolve at write time" —
    // use the user's goal template, general-fitness as the floor.
    clearTimers();
    router.push(NEXT_ROUTE);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TopChrome step={10} onBack={() => router.back()} onClose={confirmQuit} />

      {status === 'error' ? (
        <BuildingPlanError
          onRetry={runBuild}
          onUseStarterPlan={handleUseStarterPlan}
        />
      ) : (
        <View style={styles.center}>
          <WeekStrip
            fillStates={fillStates}
            dotSize={38}
            gap={spacing.sm}
            style={{ alignSelf: 'center' }}
          />
          <Animated.Text style={[styles.headline, { opacity: fadeAnim }]}>
            {HEADLINES[phase]}
          </Animated.Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  headline: {
    ...text.h1,
    color: palette.text,
    textAlign: 'center',
  },
});
