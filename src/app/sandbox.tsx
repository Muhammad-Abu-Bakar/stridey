// src/app/sandbox.tsx
//
// Throwaway dev route for visually smoke-testing components.
// DELETE before launch.
//
// Access via URL: http://localhost:8081/sandbox
// Hidden from the tab bar (no NativeTabs.Trigger declared in AppTabs).

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { WeekStrip } from '@/components/week-strip';
import { fonts, palette, sizes, spacing } from '@/theme';

export default function Sandbox() {
  const [days, setDays] = useState<boolean[]>([
    false, false, false, false, false, false, false,
  ]);

  const toggleDay = (i: number) =>
    setDays((d) => d.map((v, j) => (j === i ? !v : v)));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>WeekStrip sandbox</Text>
      <Text style={styles.subtitle}>
        Visual smoke test. Throwaway file — delete before launch.
      </Text>

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
    </ScrollView>
  );
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
});
