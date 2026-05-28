import { type Goal, effectiveGoal } from '@/lib/onboarding/store';

export function threeDayDescription(goal: Goal | null): string {
  const g: Exclude<Goal, 'help-me-choose'> =
    goal === null ? 'general-fitness' : effectiveGoal(goal);
  switch (g) {
    case 'first-5k':        return 'Steady ramp — recommended for your first 5K.';
    case 'faster-5k':       return 'Steady ramp — recommended to improve your 5K time.';
    case 'build-10k':       return 'Steady ramp — recommended to safely build to 10K.';
    case 'general-fitness': return 'Steady ramp — recommended for consistent progress.';
  }
}
