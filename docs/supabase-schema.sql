-- Stridey Supabase Schema
-- IMPORTANT: age_bracket is intentionally NOT in this schema.
-- Age stays device-only per privacy promise on screen 4.

create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  units text default 'km' check (units in ('km','mi')),
  created_at timestamptz default now()
);

create table plan_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  weeks integer not null,
  days_per_week integer not null,
  target_distance_m integer,
  difficulty text check (difficulty in ('absolute_beginner','beginner','intermediate'))
);

create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  template_id uuid references plan_templates not null,
  start_date date not null,
  end_date date not null,
  -- Snapshots onboarding inputs the session generator needs (available_days, starting_point); ageBucket excluded per Screen 4 privacy promise.
  generation_inputs jsonb,
  status text default 'active' check (status in ('active','completed','abandoned')),
  created_at timestamptz default now()
);

create table plan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_plan_id uuid references user_plans not null,
  week_number integer not null,
  day_of_week integer not null check (day_of_week between 1 and 7),
  scheduled_date date not null,
  session_type text not null,
  description text,
  target_duration_min integer,
  completed boolean default false
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan_session_id uuid references plan_sessions,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  distance_m integer,
  duration_s integer,
  avg_pace_s_per_km integer,
  route_geojson jsonb,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table user_plans enable row level security;
alter table plan_sessions enable row level security;
alter table runs enable row level security;
alter table plan_templates enable row level security;

create policy "users see own profile" on profiles for all using (auth.uid() = id);
create policy "users see own plans" on user_plans for all using (auth.uid() = user_id);
create policy "users see own sessions" on plan_sessions for all 
  using (auth.uid() = (select user_id from user_plans where id = user_plan_id));
create policy "users see own runs" on runs for all using (auth.uid() = user_id);
create policy "anyone reads templates" on plan_templates for select using (true);
