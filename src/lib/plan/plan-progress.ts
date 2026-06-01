import { fromISO, daysBetween } from '@/lib/dates';

export type Phase = 'pre' | 'active' | 'complete';

export type Progress = {
  phase: Phase;
  currentWeek: number;
  weeksToGo: number;
  progress: number;
};

export function planProgress(startISO: string, weeks: number, today: Date): Progress {
  const d = daysBetween(fromISO(startISO), today);
  if (d < 0) {
    return { phase: 'pre', currentWeek: 0, weeksToGo: weeks, progress: 0 };
  }
  if (d >= weeks * 7) {
    return { phase: 'complete', currentWeek: weeks, weeksToGo: 0, progress: 1 };
  }
  const currentWeek = Math.min(weeks, Math.floor(d / 7) + 1);
  return {
    phase: 'active',
    currentWeek,
    weeksToGo: weeks - currentWeek,
    progress: Math.min(1, (d + 1) / (weeks * 7)),
  };
}
