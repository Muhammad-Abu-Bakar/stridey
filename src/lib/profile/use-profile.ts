import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type LoadingState = { kind: 'loading' };
type ErrorState   = { kind: 'error' };
type ReadyState   = {
  kind: 'ready';
  email: string;
  name: string | null;
  units: 'km' | 'mi';
  createdAt: string;
  updateUnits: (u: 'km' | 'mi') => Promise<void>;
  updateName:  (input: string) => Promise<void>;
};

export type ProfileState = LoadingState | ErrorState | ReadyState;

export function useProfile(): ProfileState {
  const [state, setState] = useState<ProfileState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) setState({ kind: 'error' });
        return;
      }
      const userId = session.user.id;
      const email  = session.user.email ?? '';

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, units, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        console.warn('[useProfile] fetch failed', error);
        setState({ kind: 'error' });
        return;
      }

      function ready(name: string | null, units: 'km' | 'mi'): ReadyState {
        return {
          kind: 'ready',
          email,
          name,
          units,
          createdAt: data!.created_at,
          updateUnits: async (u) => {
            let previous: 'km' | 'mi' = u;
            setState(prev => {
              if (prev.kind !== 'ready') return prev;
              previous = prev.units;
              return { ...prev, units: u };
            });
            const { error } = await supabase
              .from('profiles')
              .update({ units: u })
              .eq('id', userId);
            if (error) {
              console.warn('[useProfile] updateUnits failed', error);
              setState(prev => prev.kind === 'ready' ? { ...prev, units: previous } : prev);
            }
          },
          updateName: async (input) => {
            const trimmed = input.trim();
            const next = trimmed.length ? trimmed : null;
            let previous: string | null = next;
            setState(prev => {
              if (prev.kind !== 'ready') return prev;
              previous = prev.name;
              return { ...prev, name: next };
            });
            const { error } = await supabase
              .from('profiles')
              .update({ display_name: next })
              .eq('id', userId);
            if (error) {
              console.warn('[useProfile] updateName failed', error);
              setState(prev => prev.kind === 'ready' ? { ...prev, name: previous } : prev);
            }
          },
        };
      }

      setState(ready(data.display_name ?? null, (data.units as 'km' | 'mi') ?? 'km'));
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}
