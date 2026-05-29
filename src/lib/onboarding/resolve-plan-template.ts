import { supabase } from '@/lib/supabase';
import { planSlug } from '@/lib/onboarding/plan-duration';
import type { Goal, WeeklyFrequency } from '@/lib/onboarding/store';

/**
 * Resolve the plan_templates row id for a goal + frequency. Reads the public
 * plan_templates table — no auth needed here (account creation is screen 11).
 * Returns the template UUID, which screen 12 writes to user_plans.template_id.
 *
 * Rejects on network failure OR if no matching row exists (a missing seed is a
 * real broken state, not something to swallow). The caller (screen 10) owns
 * timeout and retry; this function just runs the query.
 */
export async function resolvePlanTemplate(
  goal: Goal,
  frequency: WeeklyFrequency,
): Promise<string> {
  const slug = planSlug(goal, frequency);
  const { data, error } = await supabase
    .from('plan_templates')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`No plan_template for slug "${slug}"`);
  return data.id;
}
