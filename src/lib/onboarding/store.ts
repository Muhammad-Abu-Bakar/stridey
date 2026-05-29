// src/lib/onboarding/store.ts
//
// Single Zustand store for all onboarding state collected across screens 2–12.
// Persisted to AsyncStorage under 'stridey-onboarding-v1'.
//
// Privacy invariant: ageBucket NEVER leaves this device. The Supabase write
// on screen 11 accepts SupabaseOnboardingPayload (see bottom of file), which
// structurally excludes ageBucket, locationPermission, notificationsPermission,
// and the transient hasHydrated flag.
//
// Day indexing: AvailableDays uses Mon=0 … Sun=6. This differs from JS's
// Date.getDay() which uses Sun=0. Always convert via jsDayToMonIndex().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ─── Domain types ────────────────────────────────────────────────────

export type Goal =
  | 'first-5k'
  | 'faster-5k'
  | 'build-10k'
  | 'general-fitness'
  | 'help-me-choose'; // stored as-is for analytics; use effectiveGoal() downstream

export type StartingPoint = 0 | 1 | 2 | 3;
// 0 = not running yet
// 1 = jog then walk  (also the "Not sure yet" fallback)
// 2 = ~3K without stopping
// 3 = 8–10K comfortable

export type AgeBucket = 1 | 2 | 3 | 4 | 5;
// 1=13–19  2=20–29  3=30–39  4=40–49  5=50+

export type WeeklyFrequency = 2 | 3;

// Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
// NOTE: differs from JS Date.getDay() (Sun=0). Use jsDayToMonIndex() to convert.
export type AvailableDays = [
  boolean, // Mon
  boolean, // Tue
  boolean, // Wed
  boolean, // Thu
  boolean, // Fri
  boolean, // Sat
  boolean, // Sun
];

export type DateISO = string; // 'YYYY-MM-DD'

export type Units = 'mi' | 'km';

export type PermissionStatus = 'not-asked' | 'granted' | 'denied';

// ─── Day index helper ────────────────────────────────────────────────

/** Convert JS Date.getDay() (Sun=0) to AvailableDays index (Mon=0). */
export function jsDayToMonIndex(day: number): number {
  return (day + 6) % 7;
}

// ─── Goal helper ─────────────────────────────────────────────────────

/** All plan/recommendation logic must use this, never the raw Goal value. */
export function effectiveGoal(
  g: Goal,
): Exclude<Goal, 'help-me-choose'> {
  return g === 'help-me-choose' ? 'general-fitness' : g;
}

// ─── State & actions ─────────────────────────────────────────────────

interface OnboardingState {
  goal: Goal | null;                              // screen 2
  startingPoint: StartingPoint | null;            // screen 3
  ageBucket: AgeBucket | null;                    // screen 4, device-only
  weeklyFrequency: WeeklyFrequency | null;        // screen 5
  availableDays: AvailableDays | null;            // screen 6
  startDate: DateISO | null;                      // screen 7
  units: Units | null;                            // screen 8
  templateId: string | null;                      // screen 10, resolved from plan_templates read
  locationPermission: PermissionStatus;           // screen 12
  notificationsPermission: PermissionStatus;      // screen 12

  hasHydrated: boolean; // transient — excluded from persist via partialize
}

interface OnboardingActions {
  setGoal: (v: Goal) => void;
  setStartingPoint: (v: StartingPoint) => void;
  setAgeBucket: (v: AgeBucket) => void;
  setWeeklyFrequency: (v: WeeklyFrequency) => void;
  setAvailableDays: (v: AvailableDays) => void;
  setStartDate: (v: DateISO) => void;
  setUnits: (v: Units) => void;
  setTemplateId: (v: string | null) => void;
  setLocationPermission: (v: PermissionStatus) => void;
  setNotificationsPermission: (v: PermissionStatus) => void;
  reset: () => void;
}

const INITIAL_STATE: OnboardingState = {
  goal: null,
  startingPoint: null,
  ageBucket: null,
  weeklyFrequency: null,
  availableDays: null,
  startDate: null,
  units: null,
  templateId: null,
  locationPermission: 'not-asked',
  notificationsPermission: 'not-asked',
  hasHydrated: false,
};

// ─── Store ───────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setGoal: (v) => set({ goal: v }),
      setStartingPoint: (v) => set({ startingPoint: v }),
      setAgeBucket: (v) => set({ ageBucket: v }),
      setWeeklyFrequency: (v) => set({ weeklyFrequency: v }),
      setAvailableDays: (v) => set({ availableDays: v }),
      setStartDate: (v) => set({ startDate: v }),
      setUnits: (v) => set({ units: v }),
      setTemplateId: (v) => set({ templateId: v }),
      setLocationPermission: (v) => set({ locationPermission: v }),
      setNotificationsPermission: (v) => set({ notificationsPermission: v }),

      reset: () => {
        // Clear AsyncStorage first, then reset in-memory state.
        useOnboardingStore.persist.clearStorage();
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'stridey-onboarding-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState, _version) => persistedState as OnboardingState,

      // hasHydrated is transient — never written to AsyncStorage.
      partialize: (state) => {
        const { hasHydrated: _, ...persisted } = state;
        return persisted;
      },

      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);

// ─── Per-field selectors (prevent re-renders on unrelated field changes) ─

export const useGoal = () => useOnboardingStore((s) => s.goal);
export const useStartingPoint = () => useOnboardingStore((s) => s.startingPoint);
export const useAgeBucket = () => useOnboardingStore((s) => s.ageBucket);
export const useWeeklyFrequency = () => useOnboardingStore((s) => s.weeklyFrequency);
export const useAvailableDays = () => useOnboardingStore((s) => s.availableDays);
export const useStartDate = () => useOnboardingStore((s) => s.startDate);
export const useUnits = () => useOnboardingStore((s) => s.units);
export const useTemplateId = () => useOnboardingStore((s) => s.templateId);
export const useLocationPermission = () => useOnboardingStore((s) => s.locationPermission);
export const useNotificationsPermission = () => useOnboardingStore((s) => s.notificationsPermission);
export const useHasHydrated = () => useOnboardingStore((s) => s.hasHydrated);

// ─── Supabase write payload type ──────────────────────────────────────
//
// The screen-11 write function MUST accept this type, not OnboardingState.
// Structural enforcement means ageBucket cannot accidentally be included —
// it is absent from this type, so it cannot be passed.

export type SupabaseOnboardingPayload = Omit<
  OnboardingState,
  'ageBucket' | 'hasHydrated' | 'locationPermission' | 'notificationsPermission'
>;
