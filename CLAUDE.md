This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Design phase complete (12/12 onboarding screens).

Code phase in progress:
- Expo + TypeScript scaffold complete (c033fcc)
- 9 core libraries installed (df2d7d5): @supabase/supabase-js, zustand, @react-native-async-storage/async-storage, expo-localization, @react-native-community/datetimepicker, expo-location, expo-notifications, expo-auth-session, expo-crypto
- `react-native-url-polyfill` installed for Supabase URL constructor support in the RN runtime (a2a1763)
- Supabase project live: schema applied (5 tables with RLS enabled), credentials in `.env` using new `sb_publishable_` key format (not legacy anon JWT)
- Supabase client at `lib/supabase.ts` with AsyncStorage session persistence, `autoRefreshToken: true`, `detectSessionInUrl: false` (RN uses deep links, not URL hash fragments)
- Smoke-tested via `npm start` + web preview: clean boot, no console errors

Next: build shared primitives (WeekStrip first), then the 12 onboarding screens.

## Commands

Standard Expo scripts: `npm start`, `npm run android`, `npm run ios`, `npm run web`. Run `npx expo-doctor` periodically to verify SDK and package alignment.

## Stack

- **React Native + Expo + TypeScript** — Android primary, iOS secondary
- **Supabase** — auth, PostgreSQL database, Row Level Security
- **Expo Router** with `src/app/` directory layout (confirmed via scaffold)

## Repo discipline

Commit message format: `design(screen-N): description` for design work, `feat:`, `fix:`, `docs:` for code. One commit per completed screen or feature. Push before starting the next step.

## Architecture decisions (pre-scaffold)

### Onboarding flow

12-screen flow: welcome → goal → ability → age → frequency → days → start date → units → plan summary → building loader → account creation → permissions. Cross-screen state must be managed via a **Zustand store** (`useOnboardingStore`) with AsyncStorage persistence so users can resume mid-onboarding.

On the final screen (permissions), write state to Supabase `profiles` + `user_plans` tables, clear AsyncStorage, and navigate to `/home` with the onboarding stack replaced (not pushed).

### Critical privacy constraint

`ageBucket` (screen 4) **must never sync to Supabase**. It must stay in device-local AsyncStorage only. The privacy promise was made in UI copy. The Supabase schema intentionally excludes this field — keep it that way.

### Supabase schema (5 tables)

Schema is **live** in the production Supabase project — see `docs/supabase-schema.sql` for the canonical DDL.

- `profiles` — user settings (units: `km`|`mi`, display_name); linked to `auth.users`
- `plan_templates` — 8 seed plans (4 goals × 2 frequency variants); public read
- `user_plans` — user's active/completed/abandoned plan instances
- `plan_sessions` — individual scheduled sessions within a plan
- `runs` — GPS-recorded runs, optionally linked to a plan session

All tables have RLS enabled. `age_bracket` is intentionally absent (privacy promise on screen 4).

### Auth

v1: Email + Google (Supabase Auth + `expo-auth-session` + `expo-crypto`). Password rule: 8+ characters, no complexity regex (NIST 800-63B). Apple sign-in deferred to iOS launch (mandatory by Apple's rule when any third-party social login is present).

## Components to build first

Build these as standalone shared components from the start:

1. **`<WeekStrip />`** — three modes: cadence (pass `filled: number`), specific-days read-only (pass `days: boolean[7]` + `showLabels`), specific-days interactive (also pass `onToggle(index)`). Used on screens 5, 6, 9, 10, 11 and planned for home dashboard, plan detail, history.
2. **`<OnboardingCard />`** — 88dp standard / 96dp tall variant, orange selection state (border + checkmark)
3. **`<TopChrome />`** — back arrow + progress bar (N/12, orange fill) + close X; no progress bar on welcome screen
4. **`<PathGlyph />`** — accepts glyph name, renders hand-drawn SVG from trajectory family

## Implementation notes by screen

- **Screen 5 (frequency):** 3-day card description varies by goal — use a `copyByGoal` helper, not hardcoded strings
- **Screen 6 (available days):** min-selection count comes from frequency chosen on screen 5
- **Screen 7 (start date):** use `@react-native-community/datetimepicker` for the custom date picker; do not build a custom calendar
- **Screen 8 (units):** default from `expo-localization` — Miles for `US`, `GB`, `LR`, `MM` regions; Kilometres elsewhere
- **Screen 10 (building loader):** WeekStrip animated fill — user's days fill in selection order (orange), then remaining days fill muted grey. Three phased headlines ~900ms each. Hard cap 4s. Error state at 6s soft timeout with "Retry" + "Use a starter plan" fallback
- **Screen 12 (permissions):** `expo-location` (ACCESS_FINE_LOCATION only — no background), `expo-notifications`. Location denial → soft proceed + home banner. Notification denial → never re-prompt in-app. Persist grant state to AsyncStorage for cold-start checks.

## Deferred features (do not implement in v1.0)

- "Help me choose" guided goal picker (stubs to General Fitness)
- Apple sign-in (iOS launch)
- Gender, injury history (v1.1 settings screen)
- Apple Watch / Wear OS integration (v2.0)
- Social / leaderboards (v2.0 or never)
