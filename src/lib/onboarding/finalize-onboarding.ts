// src/lib/onboarding/finalize-onboarding.ts
//
// Writes the completed onboarding state to Supabase (profiles + user_plans),
// marks onboarding done in AsyncStorage, and resets the Zustand store.
// Must be called from Screen 12 after the user grants or denies permissions.
// Does not navigate — the calling screen owns that transition.
//
// Throws on any error so the caller can show feedback and allow a retry.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import { resolvePlanTemplate } from '@/lib/onboarding/resolve-plan-template';
import { computePlanEndISO } from '@/lib/onboarding/plan-duration';
import {
  effectiveGoal,
  useOnboardingStore,
  type SupabaseOnboardingPayload,
} from '@/lib/onboarding/store';

export const ONBOARDING_COMPLETE_KEY = 'stridey-onboarding-complete';

export async function finalizeOnboarding(
  payload: SupabaseOnboardingPayload,
): Promise<void> {
  // Step 1 — Require an active session; Screen 11 must have run first.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) {
    throw new Error(
      'No authenticated session. Account creation (Screen 11) must complete before finalizing onboarding.',
    );
  }
  const userId = session.user.id;

  // Step 2 — All three scheduling fields are non-negotiable.
  const { weeklyFrequency, availableDays, startDate } = payload;
  if (weeklyFrequency == null || availableDays == null || startDate == null) {
    throw new Error(
      'Cannot write a partial plan: weeklyFrequency, availableDays, and startDate are all required.',
    );
  }

  const concreteGoal = effectiveGoal(payload.goal ?? 'general-fitness');

  // Step 3 — Use the cached template ID from Screen 10, or fetch it now.
  const resolvedTemplateId =
    payload.templateId ?? (await resolvePlanTemplate(concreteGoal, weeklyFrequency));

  // Step 4 — Inclusive plan end date, same formula as Screen 7 preview.
  const endDate = computePlanEndISO(concreteGoal, weeklyFrequency, startDate);

  // Step 5 — Upsert profile (idempotent; safe to retry).
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: null, units: payload.units ?? 'km' });
  if (profileError) throw profileError;

  // Step 6 — Insert the user's plan with the generation_inputs snapshot.
  const { error: planError } = await supabase.from('user_plans').insert({
    user_id:           userId,
    template_id:       resolvedTemplateId,
    start_date:        startDate,
    end_date:          endDate,
    status:            'active',
    generation_inputs: {
      availableDays,
      startingPoint: payload.startingPoint,
    },
  });
  if (planError) throw planError;

  // Step 7 — Both writes succeeded; commit locally and clear onboarding state.
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  useOnboardingStore.getState().reset();
}
