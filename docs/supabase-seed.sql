-- docs/supabase-seed.sql
--
-- Idempotent seed for plan_templates.
--
-- Values (weeks, days_per_week) MUST stay in sync with
-- src/lib/onboarding/plan-duration.ts, which is the single source of truth for
-- session counts. weeks = planSessions(goal) / frequency. Re-running this file
-- is safe — ON CONFLICT updates values in place and preserves each row's id so
-- that existing user_plans.template_id foreign keys remain valid.

INSERT INTO plan_templates (slug, title, weeks, days_per_week, target_distance_m, difficulty)
VALUES
  ('first-5k-2day',        'First 5K',       12, 2, 5000,  'absolute_beginner'),
  ('first-5k-3day',        'First 5K',        8, 3, 5000,  'absolute_beginner'),
  ('faster-5k-2day',       'Faster 5K',       9, 2, 5000,  'intermediate'),
  ('faster-5k-3day',       'Faster 5K',       6, 3, 5000,  'intermediate'),
  ('build-10k-2day',       '10K',            15, 2, 10000, 'intermediate'),
  ('build-10k-3day',       '10K',            10, 3, 10000, 'intermediate'),
  ('general-fitness-2day', 'General Fitness', 12, 2, NULL,  'beginner'),
  ('general-fitness-3day', 'General Fitness',  8, 3, NULL,  'beginner')
ON CONFLICT (slug) DO UPDATE SET
  title              = EXCLUDED.title,
  weeks              = EXCLUDED.weeks,
  days_per_week      = EXCLUDED.days_per_week,
  target_distance_m  = EXCLUDED.target_distance_m,
  difficulty         = EXCLUDED.difficulty;
