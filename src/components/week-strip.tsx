// src/components/week-strip.tsx
//
// WeekStrip — 7-dot week-rhythm primitive.
//
// MODES (TS-enforced discriminated union):
//   Cadence (read-only):       <WeekStrip filled={3} />
//   Specific-days read-only:   <WeekStrip days={[...]} showLabels />
//   Specific-days interactive: <WeekStrip days={[...]} onToggle={fn} />
//
// Used on onboarding screens 5, 6, 9, 10, 11. Animated mode for
// screen 10 is deferred — will require a fourth mode branch.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { fonts, palette, primary, sizes } from '@/theme';

// ─── Public types ─────────────────────────────────────────────────────

export type DaysOfWeek = readonly boolean[];

type CadenceModeProps = {
  filled: number;
  days?: never;
  onToggle?: never;
};

type SpecificDaysReadOnlyProps = {
  days: DaysOfWeek;
  filled?: never;
  onToggle?: never;
};

type SpecificDaysInteractiveProps = {
  days: DaysOfWeek;
  onToggle: (dayIndex: number) => void;
  filled?: never;
};

type ModeProps =
  | CadenceModeProps
  | SpecificDaysReadOnlyProps
  | SpecificDaysInteractiveProps;

type CommonProps = {
  /** Read-only emphasis. Filled dots use primary at full opacity when true,
   *  textDim @ 50% when false. Ignored in interactive mode. @default false */
  selected?: boolean;
  /** Render M T W T F S S above the dot row. Ignored when labelsInside.
   *  @default false */
  showLabels?: boolean;
  /** Render each day's letter inside the dot. Requires dotSize ≥ 28.
   *  @default false */
  labelsInside?: boolean;
  /** Dot diameter in dp. @default 10 (sizes.weekStripDotInline) */
  dotSize?: number;
  /** Horizontal gap between dots in dp. @default 6 (sizes.weekStripGap) */
  gap?: number;
  /** Style escape hatch on the outer wrapper. Use sparingly. */
  style?: ViewStyle;
};

export type WeekStripProps = ModeProps & CommonProps;

// ─── Internal constants ───────────────────────────────────────────────

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const FULL_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

// Default cadence patterns for the 1–7 days-per-week range. Visual
// rhythm only — the plan engine assigns real days later.
const CADENCE: Record<number, readonly boolean[]> = {
  1: [false, false, true,  false, false, false, false],
  2: [false, true,  false, false, true,  false, false],
  3: [true,  false, false, true,  false, true,  false],
  4: [true,  false, true,  false, true,  false, true ],
  5: [true,  true,  false, true,  true,  false, true ],
  6: [true,  true,  true,  true,  true,  true,  false],
  7: [true,  true,  true,  true,  true,  true,  true ],
};

const EMPTY_PATTERN: readonly boolean[] = [
  false, false, false, false, false, false, false,
];

// ─── Component ────────────────────────────────────────────────────────

export function WeekStrip(props: WeekStripProps) {
  const {
    selected = false,
    showLabels = false,
    labelsInside = false,
    dotSize = sizes.weekStripDotInline,
    gap = sizes.weekStripGap,
    style,
    days,
    filled,
    onToggle,
  } = props;

  // Dev-only length check on `days`. Caught during development, silent
  // in production builds where __DEV__ is false.
  if (__DEV__ && days !== undefined && days.length !== 7) {
    console.warn(
      `WeekStrip: \`days\` must be length 7, got ${days.length}. ` +
      `Falling back to empty pattern.`
    );
  }

  // Resolve which 7-dot pattern to render.
  const pattern: readonly boolean[] = (() => {
    if (days && days.length === 7) return days;
    if (filled !== undefined) {
      const clamped = Math.max(1, Math.min(7, Math.round(filled)));
      return CADENCE[clamped];
    }
    return EMPTY_PATTERN;
  })();

  const interactive = typeof onToggle === 'function';
  const emphasised = interactive || selected;

  function renderDot(on: boolean, i: number) {
    const dotStyle: ViewStyle = {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: on
        ? (emphasised ? primary : palette.text)
        : 'transparent',
      borderWidth: on ? 0 : sizes.weekStripBorderWidth,
      borderColor: on
        ? 'transparent'
        : (emphasised ? `${primary}55` : palette.border),
      opacity: on ? (emphasised ? 1 : 0.5) : 1,
      alignItems: 'center',
      justifyContent: 'center',
    };

    const labelFontSize = labelsInside
      ? Math.max(11, Math.round(dotSize * 0.34))
      : 0;

    const letterEl = labelsInside ? (
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: labelFontSize,
          lineHeight: labelFontSize,
          color: on ? palette.bg : palette.textDim,
          letterSpacing: 0.02 * labelFontSize,
        }}
      >
        {LETTERS[i]}
      </Text>
    ) : null;

    if (interactive && onToggle) {
      return (
        <Pressable
          key={i}
          accessibilityRole="button"
          accessibilityState={{ selected: on }}
          accessibilityLabel={FULL_DAYS[i]}
          onPress={() => onToggle(i)}
          style={({ pressed }) => [
            dotStyle,
            pressed && styles.dotPressed,
          ]}
        >
          {letterEl}
        </Pressable>
      );
    }

    return (
      <View key={i} style={dotStyle}>
        {letterEl}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showLabels && !labelsInside && (
        <View style={[styles.labelsRow, { gap }]}>
          {LETTERS.map((letter, i) => (
            <Text
              key={i}
              style={[styles.labelOutside, { width: dotSize }]}
            >
              {letter}
            </Text>
          ))}
        </View>
      )}

      <View style={[styles.dotsRow, { gap }]}>
        {pattern.map(renderDot)}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  labelsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dotsRow: {
    flexDirection: 'row',
  },
  labelOutside: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9.5,
    color: palette.textVeryDim,
    letterSpacing: 0.38,  // 0.04em × 9.5
    textAlign: 'center',
  },
  dotPressed: {
    transform: [{ scale: 0.94 }],
  },
});
