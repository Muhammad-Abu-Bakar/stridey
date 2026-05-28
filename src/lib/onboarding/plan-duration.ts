// src/lib/onboarding/plan-duration.ts
//
// SINGLE SOURCE OF TRUTH for plan length.
//
// The Supabase plan_templates seed MUST mirror the values in SESSION_COUNT.
// If the two diverge, the onboarding preview (Screen 7 end-date, Screen 9
// summary) will lie about the plan that is actually generated.
//
// INVARIANT: all session counts are multiples of 6 so that both supported
// frequencies (2 and 3 days/week) divide to whole weeks. If a future goal
// breaks this invariant, planWeeks() must be revisited — it will silently
// return a fractional week otherwise.

import { effectiveGoal } from '@/lib/onboarding/store';
import type { Goal, WeeklyFrequency } from '@/lib/onboarding/store';

// ─── Session counts by goal ──────────────────────────────────────────
// Typed as Record<Exclude<Goal, 'help-me-choose'>, number> so the compiler
// enforces exhaustiveness — adding a new concrete goal without updating
// this table is a type error.

const SESSION_COUNT: Record<Exclude<Goal, 'help-me-choose'>, number> = {
  'first-5k':        24,
  'faster-5k':       18,
  'build-10k':       30,
  'general-fitness': 24,
};

// ─── Public helpers ──────────────────────────────────────────────────

export function planSessions(goal: Goal): number {
  return SESSION_COUNT[effectiveGoal(goal)];
}

export function planWeeks(goal: Goal, frequency: WeeklyFrequency): number {
  return planSessions(goal) / frequency;
}
