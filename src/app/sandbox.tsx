// src/app/sandbox.tsx
//
// Throwaway dev route for visually smoke-testing components.
// DELETE before launch.
//
// Access via URL: http://localhost:8081/sandbox
// Hidden from the tab bar (no NativeTabs.Trigger declared in AppTabs).

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OnboardingCard } from '@/components/onboarding-card';
import { TopChrome } from '@/components/top-chrome';
import { WeekStrip } from '@/components/week-strip';
import { fonts, palette, sizes, spacing } from '@/theme';

export default function Sandbox() {
  const [days, setDays] = useState<boolean[]>([
    false, false, false, false, false, false, false,
  ]);

  const toggleDay = (i: number) =>
    setDays((d) => d.map((v, j) => (j === i ? !v : v)));

  const [goalIndex, setGoalIndex] = useState<number | null>(null);
  const [chromeStep, setChromeStep] = useState(1);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Component sandbox</Text>
      <Text style={styles.subtitle}>
        Visual smoke test. Throwaway file — delete before launch.
      </Text>

      {/* ─── WeekStrip ─────────────────────────────────────────── */}

      <Text style={styles.componentHeading}>WeekStrip</Text>

      <Section title="Cadence — read-only, muted (selected={false})">
        <WeekStrip filled={2} />
        <WeekStrip filled={3} />
        <WeekStrip filled={5} />
      </Section>

      <Section title="Cadence — read-only, emphasized (selected={true})">
        <WeekStrip filled={2} selected />
        <WeekStrip filled={3} selected />
        <WeekStrip filled={5} selected />
      </Section>

      <Section title="Specific days — read-only with labels above">
        <WeekStrip
          days={[true, false, false, true, false, true, false]}
          showLabels
          selected
        />
        <WeekStrip
          days={[true, true, false, true, true, false, true]}
          showLabels
        />
      </Section>

      <Section title="Specific days — interactive, big dots, labels inside">
        <WeekStrip
          days={days}
          onToggle={toggleDay}
          labelsInside
          dotSize={sizes.weekStripDotInteractive}
        />
        <Text style={styles.note}>
          Tap dots to toggle. Selected: {days.filter(Boolean).length}/7
        </Text>
      </Section>

      <Section title="Mini variant (screen 11 plan chip)">
        <WeekStrip
          days={[true, false, false, true, false, true, false]}
          dotSize={6}
          gap={3}
          selected
        />
      </Section>

      {/* ─── OnboardingCard ────────────────────────────────────── */}

      <Text style={styles.componentHeading}>OnboardingCard</Text>

      <Section title="Standard — title only">
        <OnboardingCard
          title="Run my first 5K"
          selected={false}
          onPress={() => {}}
        />
        <OnboardingCard
          title="Run my first 5K"
          selected
          onPress={() => {}}
        />
      </Section>

      <Section title="Standard — title + description">
        <OnboardingCard
          title="Run a faster 5K"
          description="You can run 5K — want to be quicker"
          selected={false}
          onPress={() => {}}
        />
        <OnboardingCard
          title="Run a faster 5K"
          description="You can run 5K — want to be quicker"
          selected
          onPress={() => {}}
        />
      </Section>

      <Section title="Tall — leading + title + description">
        <OnboardingCard
          variant="tall"
          leading={<LeadingPlaceholder />}
          title="I can jog a bit, then walk"
          description="Stop-start rhythm — that's fine"
          selected={false}
          onPress={() => {}}
        />
        <OnboardingCard
          variant="tall"
          leading={<LeadingPlaceholder />}
          title="I can jog a bit, then walk"
          description="Stop-start rhythm — that's fine"
          selected
          onPress={() => {}}
        />
      </Section>

      <Section title="Disabled">
        <OnboardingCard
          title="Coming soon"
          description="Not available yet"
          selected={false}
          onPress={() => {}}
          disabled
        />
      </Section>

      <Section title="Interactive — single-select group (mimics screen 2)">
        {[
          'Run my first 5K',
          'Run a faster 5K',
          'Build to 10K',
          'General fitness',
        ].map((title, i) => (
          <OnboardingCard
            key={title}
            title={title}
            selected={goalIndex === i}
            onPress={() => setGoalIndex(i)}
          />
        ))}
        <Text style={styles.note}>
          Selected: {goalIndex === null ? 'none' : goalIndex}
        </Text>
      </Section>

      {/* ─── TopChrome ─────────────────────────────────────────── */}

      <Text style={styles.componentHeading}>TopChrome</Text>

      <Section title="Welcome variant — no step, only close">
        <View style={styles.fullWidth}>
          <TopChrome onClose={() => {}} />
        </View>
      </Section>

      <Section title="Step 1 of 12 — first onboarding (no back)">
        <View style={styles.fullWidth}>
          <TopChrome step={1} onClose={() => {}} />
        </View>
      </Section>

      <Section title="Step 6 of 12 — mid-onboarding">
        <View style={styles.fullWidth}>
          <TopChrome step={6} onBack={() => {}} onClose={() => {}} />
        </View>
      </Section>

      <Section title="Step 12 of 12 — final screen">
        <View style={styles.fullWidth}>
          <TopChrome step={12} onBack={() => {}} onClose={() => {}} />
        </View>
      </Section>

      <Section title="Interactive — tap +/- to watch the bar animate">
        <View style={styles.fullWidth}>
          <TopChrome
            step={chromeStep}
            onBack={() => {}}
            onClose={() => {}}
          />
        </View>
        <View style={styles.stepRow}>
          <Pressable
            onPress={() => setChromeStep((s) => Math.max(1, s - 1))}
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Decrement step"
          >
            <Text style={styles.stepButtonText}>−</Text>
          </Pressable>
          <Text style={styles.stepLabel}>step {chromeStep} / 12</Text>
          <Pressable
            onPress={() => setChromeStep((s) => Math.min(12, s + 1))}
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Increment step"
          >
            <Text style={styles.stepButtonText}>+</Text>
          </Pressable>
        </View>
      </Section>
    </ScrollView>
  );
}

function LeadingPlaceholder() {
  return <View style={styles.leadingPlaceholder} />;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: palette.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: palette.textDim,
  },
  componentHeading: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: palette.text,
    marginTop: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: palette.textDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionBody: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: palette.textDim,
  },
  leadingPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: palette.border,
  },
  fullWidth: {
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonPressed: {
    opacity: 0.7,
  },
  stepButtonText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: palette.text,
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: palette.textDim,
  },
});
