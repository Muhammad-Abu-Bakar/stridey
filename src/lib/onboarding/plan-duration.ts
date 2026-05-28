// src/lib/onboarding/plan-duration.ts
//
// SINGLE SOURCE OF TRUTH for per-goal canonical plan metadata: name, session
// count, weeks, and session minutes. The Supabase plan_templates seed MUST
// mirror all values here. If the two diverge, the onboarding preview (Screen 7
// end-date, Screen 9 summary) will lie about the plan that is actually generated.
//
// INVARIANT: all session counts are multiples of 6 so that both supported
// frequencies (2 and 3 days/week) divide to whole weeks. If a future goal
// breaks this invariant, planWeeks() must be revisited — it will silently
// return a fractional week otherwise.

import { effectiveGoal } from '@/lib/onboarding/store';
import type { Goal, WeeklyFrequency } from '@/lib/onboarding/store';

// ─── Per-goal metadata ───────────────────────────────────────────────
// All tables typed as Record<Exclude<Goal, 'help-me-choose'>, T> so the
// compiler enforces exhaustiveness — adding a new concrete goal without
// updating these tables is a type error.

const SESSION_COUNT: Record<Exclude<Goal, 'help-me-choose'>, number> = {
  'first-5k':        24,
  'faster-5k':       18,
  'build-10k':       30,
  'general-fitness': 24,
};

// No "Plan" suffix — intentional; the Screen 9 layout carries that word.
const GOAL_NAMES: Record<Exclude<Goal, 'help-me-choose'>, string> = {
  'first-5k':        'First 5K',
  'faster-5k':       'Faster 5K',
  'build-10k':       '10K',
  'general-fitness': 'General Fitness',
};

const GOAL_SESSION_MINUTES: Record<Exclude<Goal, 'help-me-choose'>, number> = {
  'first-5k':        30,
  'faster-5k':       35,
  'build-10k':       40,
  'general-fitness': 30,
};

// ─── Public helpers ──────────────────────────────────────────────────

export function planSessions(goal: Goal): number {
  return SESSION_COUNT[effectiveGoal(goal)];
}

export function planWeeks(goal: Goal, frequency: WeeklyFrequency): number {
  return planSessions(goal) / frequency;
}

export function planName(goal: Goal): string {
  return GOAL_NAMES[effectiveGoal(goal)];
}

export function planSessionMinutes(goal: Goal): number {
  return GOAL_SESSION_MINUTES[effectiveGoal(goal)];
}
