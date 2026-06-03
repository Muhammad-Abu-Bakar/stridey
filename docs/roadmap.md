# Stridey — feature backlog

Running list of features and improvements. Drop new ideas under "Inbox", then promote them into a section once scoped. Effort: S = hours, M = days, L = a week+.

## Next up (highest priority)
- Background GPS tracking (L) — swap an expo-task-manager background task into the location source so tracking survives screen-off / app-backgrounded. Needs ACCESS_BACKGROUND_LOCATION, a foreground service + notification, and a Play background-location declaration. This is what makes runs usable for real.
- Run history + real Profile stats (M) — list past runs; replace Profile's "No runs recorded yet" with totals (distance, runs, time). `runs` already has data.
- Respect mi/km in the run screen (S) — currently km-only; honor profiles.units.

## Run experience
- Route map on a finished / past run (M) — render the stored route_geojson. Adds react-native-maps (watch app size).
- Run detail screen (M) — tap a past run for full stats + map.
- Per-km splits (M).
- Countdown before start, 3-2-1 (S).
- Auto-pause when stopped (M).
- GPS signal strength indicator during a run (S).
- Audio / voice cues, e.g. distance + pace each km (M).
- Manual run entry, log a run with no GPS (S-M).
- Edit / delete a run (S).

## Plan & sessions
- Decide the sessions fork (L, ARCHITECTURAL) — generated vs authored per-template session content. Gates everything below it.
- "Today's session" card on Home (M) — the seam is already left for it. Needs sessions.
- Link a run to the day's planned session via plan_session_id (S). Needs sessions.
- Populate the Plan week rows with real sessions (M). Needs sessions.

## Account & auth
- Sign-in screen (M) — so a signed-out user logs back in without re-onboarding. Current sign-out is a stopgap.
- Make finalizeOnboarding idempotent (S) — stop re-onboarding stacking duplicate user_plans. Pairs with sign-in.
- Wire Google OAuth (M) — "Continue with Google" is still a stub. Needs a Google Cloud OAuth client + Supabase provider + signing SHA-1.
- Capture name during onboarding (S) — so display_name isn't null by default.

## Reliability & data
- Offline save queue (M) — keep runs recorded without internet, sync when back online. Right now a failed save loses the run.
- Crash / error reporting, e.g. Sentry (S).

## Polish & UX
- Real tab icons, plan.png / profile.png, + active-icon tint (S) — currently a placeholder icon and the active icon renders black.
- Run reminders / notifications tied to plan days (M).
- Streaks / goals (M).
- Share a run as an image card (M).
- Empty / loading states pass across all screens (S).

## Launch (when ready)
- App icon + splash polish (S).
- Onboarding / permissions copy review (S).
- Privacy policy (S) — Play requires one, especially with background location.
- Play Store listing (M) — screenshots, description, feature graphic, closed testing.

## Inbox (unsorted ideas)
-
