import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type ActivePlan = {
  title: string;
  weeks: number;
  startDate: string;
  endDate: string;
  availableDays: boolean[];
  status: string;
};

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'no-plan' }
  | { kind: 'ready'; plan: ActivePlan };

export function useActivePlan(): State {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn('[useActivePlan] no authenticated session');
        if (!cancelled) setState({ kind: 'error' });
        return;
      }
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('user_plans')
        .select('start_date, end_date, status, generation_inputs, plan_templates(title, weeks)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn('[useActivePlan] query error:', error);
        setState({ kind: 'error' });
        return;
      }

      if (!data) {
        setState({ kind: 'no-plan' });
        return;
      }

      const tmpl = Array.isArray(data.plan_templates)
        ? data.plan_templates[0]
        : data.plan_templates;

      if (!tmpl) {
        setState({ kind: 'error' });
        return;
      }

      setState({
        kind: 'ready',
        plan: {
          title: tmpl.title,
          weeks: tmpl.weeks,
          startDate: data.start_date,
          endDate: data.end_date,
          availableDays: data.generation_inputs?.availableDays ?? [],
          status: data.status,
        },
      });
    }

    loadPlan();
    return () => { cancelled = true; };
  }, []);

  return state;
}
