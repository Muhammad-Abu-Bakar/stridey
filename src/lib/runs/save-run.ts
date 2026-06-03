import { supabase } from '@/lib/supabase';
import type { RunSummary } from './use-run-recorder';

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

export async function saveRun(summary: RunSummary): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not signed in');
  const userId = session.user.id;

  const route_geojson =
    summary.points.length >= 2
      ? {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: summary.points.map(p => [round5(p.longitude), round5(p.latitude)]),
          },
        }
      : null;

  const { error } = await supabase.from('runs').insert({
    user_id: userId,
    plan_session_id: null,
    started_at: new Date(summary.startedAt).toISOString(),
    ended_at: new Date(summary.endedAt).toISOString(),
    distance_m: Math.round(summary.distanceM),
    duration_s: summary.durationS,
    avg_pace_s_per_km: summary.avgPaceSecPerKm,
    route_geojson,
    notes: null,
  });

  if (error) {
    console.warn('[saveRun] insert failed', error);
    throw error;
  }
}
