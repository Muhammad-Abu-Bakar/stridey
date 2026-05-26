// theme/index.ts
//
// Canonical design tokens for Stridey.
//
// Source of truth:
//   - welcome-screen.jsx (palette, typography scale, button styles)
//   - week-strip.jsx (WeekStrip dot sizes, motion timings)
//   - design-decisions.md (card heights 88/96dp, deferred features)
//
// Stridey is Android-first dark mode at launch — `palette` defaults
// to the dark theme. Light theme is captured for completeness only.
//
// FONTS: Bricolage Grotesque + DM Sans must be loaded via
// `expo-google-fonts` before render. Until loaded, RN falls back to
// the system font. See Step 2.5 (font loading) for the useFonts() setup.

// ─── Colors ──────────────────────────────────────────────────────────

export const primary = '#FF7E5C' as const;

export const palettes = {
  dark: {
    bg: '#0E1414',
    text: '#F4F1EC',
    textDim: 'rgba(244, 241, 236, 0.72)',
    textVeryDim: 'rgba(244, 241, 236, 0.55)',
    border: 'rgba(244, 241, 236, 0.16)',
    cardBg: 'rgba(244, 241, 236, 0.04)',
    secondaryBg: '#F4F1EC',
    secondaryText: '#0E1414',
    primaryText: '#0E1414',  // foreground rendered ON primary color
    counter: 'rgba(244, 241, 236, 0.55)',
  },
  light: {
    bg: '#FBF6EF',
    text: '#1A1410',
    textDim: 'rgba(26, 20, 16, 0.7)',
    textVeryDim: 'rgba(26, 20, 16, 0.55)',
    border: 'rgba(26, 20, 16, 0.14)',
    cardBg: 'rgba(26, 20, 16, 0.025)',
    secondaryBg: '#1A1410',
    secondaryText: '#FBF6EF',
    primaryText: '#1A1410',
    counter: 'rgba(26, 20, 16, 0.55)',
  },
} as const;

export type PaletteName = keyof typeof palettes;
export type Palette = (typeof palettes)[PaletteName];

// Default palette for v1 (Android-first dark mode).
export const palette: Palette = palettes.dark;

// ─── Fonts ───────────────────────────────────────────────────────────
// Names match @expo-google-fonts/bricolage-grotesque and
// @expo-google-fonts/dm-sans identifiers. Replace any unloaded entry
// with `undefined` to fall back to system font during development.

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displaySemiBold: 'BricolageGrotesque_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
} as const;

// Composite text styles. Spread these into <Text style={[text.h1, ...]} />.
// Color is intentionally omitted — apply via palette at the screen level
// so styles work in both light and dark mode without duplication.

export const text = {
  h1: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 29,         // 26 × 1.12
    letterSpacing: -0.4,    // -0.015em on 26px
  },
  brand: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 14,
    letterSpacing: 0.28,    // 0.02em on 14px
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,         // 15 × 1.45
  },
  button: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    letterSpacing: -0.08,   // -0.005em on 16px
  },
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.22,    // 0.02em on 11px
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────
// 4px-based scale. Welcome screen used 8/12/16/20/24 most commonly;
// 32 reserved for section separations.

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// ─── Radii ───────────────────────────────────────────────────────────

export const radii = {
  sm: 8,        // checkbox, small chips
  md: 16,       // (reserved)
  lg: 22,       // hero, cards
  pill: 999,    // buttons
} as const;

// ─── Component sizes ─────────────────────────────────────────────────
// Pulled from design-decisions.md and week-strip.jsx defaults.

export const sizes = {
  cardStandard: 88,             // 88dp typography-only onboarding card
  cardTall: 96,                 // 96dp variant with extra content
  buttonHeight: 52,
  buttonMinHeight: 48,
  weekStripDotInline: 10,       // cadence / preview
  weekStripDotInteractive: 48,  // tappable (availability)
  weekStripGap: 6,
  weekStripBorderWidth: 1.5,
} as const;

// ─── Motion ──────────────────────────────────────────────────────────
// All durations in ms.

export const motion = {
  pressIn: 80,   // button scale-down on tap
  fast: 120,     // checkbox state change, small toggles
  base: 180,     // color/border transitions (WeekStrip standard)
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────
// RN splits iOS (shadow*) from Android (elevation). Both are provided.
// shadowColor accepts the primary const at the import site.

export const shadows = {
  primaryButton: {
    shadowColor: primary,
    shadowOpacity: 0.23,    // 0x3a / 0xff ≈ 0.227
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
