// src/components/week-strip.tsx
//
// WeekStrip — 7-dot week-rhythm primitive.
//
// [STEP 3 COMMIT: API SURFACE ONLY. Render implementation in Step 4.]
//
// MODES (discriminated by props — TS enforces exactly one):
//   Cadence (read-only):       <WeekStrip filled={3} />
//   Specific-days read-only:   <WeekStrip days={[...]} showLabels />
//   Specific-days interactive: <WeekStrip days={[...]} onToggle={fn} />
//
// Used on 5 onboarding screens (5, 6, 9, 10, 11). The animated fill mode
// for screen 10 is deferred — see DEPLOYMENT SANITY CHECK at file end.

import type { ViewStyle } from 'react-native';

/**
 * Length-7 boolean array, Monday-first.
 * Index 0 = Mon, 1 = Tue, ..., 6 = Sun.
 * Length is enforced at runtime in the component (Step 4).
 */
export type DaysOfWeek = readonly boolean[];

// ─── Mode-specific props (discriminated union) ───────────────────────

type CadenceModeProps = {
  /**
   * Number of days to render filled (1–7). Component picks a default
   * visually-balanced pattern (e.g. 2 → Tue/Fri, 3 → Mon/Thu/Sat).
   * These patterns are visual rhythm only — the plan engine assigns
   * real days later.
   */
  filled: number;
  days?: never;
  onToggle?: never;
};

type SpecificDaysReadOnlyProps = {
  /** Length-7 boolean array, Monday-first. true = a running day. */
  days: DaysOfWeek;
  filled?: never;
  onToggle?: never;
};

type SpecificDaysInteractiveProps = {
  /** Length-7 boolean array, Monday-first. true = a running day. */
  days: DaysOfWeek;
  /**
   * Fires with the day index (0–6) when a dot is tapped. Parent owns
   * the `days` state and decides toggle semantics (flip vs replace vs
   * require-min-count, etc).
   */
  onToggle: (dayIndex: number) => void;
  filled?: never;
};

type ModeProps =
  | CadenceModeProps
  | SpecificDaysReadOnlyProps
  | SpecificDaysInteractiveProps;

// ─── Shared props (apply to all modes) ───────────────────────────────

type CommonProps = {
  /**
   * Read-only emphasis flag. When true, filled dots render in primary
   * color at full opacity. When false/undefined, filled dots render
   * muted (textDim @ 50%). Ignored in interactive mode — interactive
   * dots are always emphasized.
   *
   * @default false
   */
  selected?: boolean;

  /**
   * Render M T W T F S S labels ABOVE the dot row. Use with `days`
   * modes. Ignored when `labelsInside` is true.
   *
   * @default false
   */
  showLabels?: boolean;

  /**
   * Render each day's letter INSIDE the dot. Use for large interactive
   * dots (availability screen) where above-dot labels would feel
   * detached. Requires dotSize ≥ 28 to be legible.
   *
   * @default false
   */
  labelsInside?: boolean;

  /**
   * Dot diameter in dp.
   *
   * Suggested values from theme.sizes:
   *   10 — weekStripDotInline (cadence/preview rhythm, default)
   *   48 — weekStripDotInteractive (tappable editor)
   *    6 — mini variant for the account-creation plan chip
   *
   * @default 10
   */
  dotSize?: number;

  /**
   * Horizontal gap between dots in dp.
   *
   * @default 6 (theme.sizes.weekStripGap)
   */
  gap?: number;

  /**
   * Style escape hatch on the outer wrapper. Use sparingly — layout
   * should generally be handled by the parent placing <WeekStrip>.
   */
  style?: ViewStyle;
};

export type WeekStripProps = ModeProps & CommonProps;

// ─── Component shell (returns null until Step 4) ─────────────────────

export function WeekStrip(_props: WeekStripProps) {
  // TODO(Step 4): implement rendering.
  //   - Use Pressable for interactive mode (onPressIn/onPressOut for
  //     scale-down haptic feedback, accessibilityRole="button",
  //     accessibilityState={ selected }).
  //   - Use View+Text for read-only modes.
  //   - Import primary, palette, sizes, motion from theme module.
  //   - Hardcode cadence patterns (Mon-first):
  //       1: [_,_,T,_,_,_,_]  2: [_,T,_,_,T,_,_]  3: [T,_,_,T,_,T,_]
  //       4: [T,_,T,_,T,_,T]  5: [T,T,_,T,T,_,T]  6: [T,T,T,T,T,T,_]
  //       7: all
  //   - Runtime assert days.length === 7 in dev only (__DEV__ guard).
  return null;
}

/* ─────────────────────────────────────────────────────────────────────
 * DEPLOYMENT SANITY CHECK
 *
 * Pseudo-usage for all 5 planned deployment sites. If a future API
 * change breaks any of these examples, it's breaking — needs migration.
 *
 *   Screen 5 — frequency (cadence, read-only, emphasized):
 *     <WeekStrip filled={3} selected />
 *
 *   Screen 6 — availability (interactive, labels inside large dots):
 *     <WeekStrip
 *       days={availableDays}
 *       onToggle={(i) => toggleDay(i)}
 *       labelsInside
 *       dotSize={48}
 *     />
 *
 *   Screen 9 — plan summary (read-only specific days, labels above):
 *     <WeekStrip days={planDays} showLabels selected />
 *
 *   Screen 11 — account creation (mini variant):
 *     <WeekStrip days={planDays} dotSize={6} gap={3} />
 *
 *   Screen 10 — building plan (animated fill): NOT IN v1 API.
 *   Deferred until screen 10 is built. Likely additions:
 *     - animateFillFrom?: readonly number[]   (indices in fill order)
 *     - animateRemainderAfter?: number        (ms; greys-out tail)
 *   Will require a fourth branch in the discriminated mode union.
 * ─────────────────────────────────────────────────────────────────────
 */
