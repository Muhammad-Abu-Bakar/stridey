// src/components/path-glyph.tsx
//
// Name-keyed SVG icon component for Stridey's hand-drawn trajectory family.
// Introduced on screen 3 (running ability) as the design-system icon style.
//
// Aesthetic: 24x24 viewBox, ~1.8 stroke, rounded caps/joins, slightly
// asymmetric beziers — organic but consistent across the set. A single
// `color` prop drives stroke and fill so callers can theme it
// contextually (palette.textDim when unselected, primary when selected).
//
// Glyphs (screen 3 — running ability):
//   dot-start      → single dot at start of dashed line (haven't started)
//   dashed-broken  → irregular dashes (jog-walk rhythm)
//   smooth-curve   → continuous wave (steady running)
//   hill-curve     → longer line with a pronounced peak (experienced)
//   faint-dotted   → trailing dots, fading right (undecided / exploring)
//
// To add a glyph: append to GlyphName union + the `glyphs` map. The
// component will pick it up automatically. Screens 10 (loader error)
// and 12 (permissions) will register their glyphs here.

import { ReactNode } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { palette } from '@/theme';

export type GlyphName =
  | 'dot-start'
  | 'dashed-broken'
  | 'smooth-curve'
  | 'hill-curve'
  | 'faint-dotted';

/** Runtime list — exported so sandbox/tests can iterate without duplication. */
export const GLYPH_NAMES: readonly GlyphName[] = [
  'dot-start',
  'dashed-broken',
  'smooth-curve',
  'hill-curve',
  'faint-dotted',
] as const;

const STROKE = 1.8;

type Renderer = (color: string) => ReactNode;

const glyphs: Record<GlyphName, Renderer> = {
  'dot-start': (color) => (
    <G>
      <Circle cx={3.5} cy={12} r={2.2} fill={color} />
      <Path
        d="M7.5 12 L22 12"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray="1.5 2.5"
        fill="none"
      />
    </G>
  ),

  'dashed-broken': (color) => (
    <Path
      d="M2 12 L22 12"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeDasharray="4 2 1 1.5"
      fill="none"
    />
  ),

  'smooth-curve': (color) => (
    <Path
      d="M2 14 C 7 14 9 10 12 10 C 15 10 17 14 22 14"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  'hill-curve': (color) => (
    <Path
      d="M2 17 C 5 17 6 15 9 14.5 C 12 14 12 4 14 4 C 16 4 17 16 22 16"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  'faint-dotted': (color) => (
    <G>
      <Circle cx={3} cy={12} r={1.6} fill={color} opacity={1} />
      <Circle cx={7.5} cy={12} r={1.4} fill={color} opacity={0.7} />
      <Circle cx={12} cy={12} r={1.2} fill={color} opacity={0.5} />
      <Circle cx={16.5} cy={12} r={1} fill={color} opacity={0.3} />
      <Circle cx={21} cy={12} r={0.8} fill={color} opacity={0.15} />
    </G>
  ),
};

export type PathGlyphProps = {
  /** Which glyph in the trajectory family. */
  name: GlyphName;
  /** Pixel size (width === height). Default 24 matches Feather icons. */
  size?: number;
  /** Stroke + fill color. Default palette.text — caller dims/colors via prop. */
  color?: string;
  /** Optional accessibility label. PathGlyphs are decorative by default;
   *  the parent OnboardingCard / Pressable usually carries the label. */
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * Hand-drawn trajectory icon. Decorative by default — pass
 * `accessibilityLabel` only when the glyph carries meaning that isn't
 * already announced by a parent component.
 */
export function PathGlyph({
  name,
  size = 24,
  color = palette.text,
  accessibilityLabel,
  testID,
}: PathGlyphProps) {
  const render = glyphs[name];
  if (!render) {
    if (__DEV__) {
      console.warn(`PathGlyph: unknown name "${name}"`);
    }
    return null;
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {render(color)}
    </Svg>
  );
}
