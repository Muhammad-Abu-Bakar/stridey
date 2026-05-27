# Stridey Design Decisions

Canonical record of every design decision made during Stridey's design and development. Three jobs:

1. **Design history** — what was chosen, why
2. **Launch checklist** — what was deferred
3. **Design system spec** — reusable primitives

---

## Pivot Log

### 2026-05-24 — Positioning pivot
Changed from "training plan app for intimidated absolute beginners" to "general running app focused on execution quality." Acknowledged harder competitive position; differentiation now lives in design execution, not audience targeting. Triggering decision: chose a runner silhouette as the welcome hero image, which was off-brand for beginner positioning but on-brand for a general runner app.

### 2026-05-24 — Onboarding flow revision
Realized onboarding is `goal → ability → age → frequency → days → schedule → units → plan-ready`, not `goal → plan-card`. Plan recommendation happens AFTER calibration questions, generated from user inputs rather than picked from a static list. This matches Runna's actual architecture. Onboarding trimmed from Runna's 18 steps to Stridey's 12.

---

## Screen-by-Screen Decisions

### Screen 1 — Welcome
**Reference:** Runna welcome screen ("Welcome to the club Muhammad" + group photo + email opt-in + Get started/referral code).

**Differentiation chosen:** Layout from reference, but Stridey copy and runner-silhouette hero (no athletic group photo). Email opt-in removed entirely (deferred to post-plan-generation). "Welcome to the club" language dropped.

**Final copy:**
- Headline: "Hi Sam."
- Subhead: "We'll go at your pace. One step at a time."
- Hero: Unsplash photo (runner silhouette at golden hour, Kyle Bushnell, photo ID `A0iyW5nsoac`). Free under Unsplash License.
- Primary CTA: "Get started"

**KNOWN ISSUE:** hero image leans "athletic golden hour" — was wrong for beginner positioning, but after pivot to general runner app, it's now on-brand. Keep.

**Sketch file:** `Welcome.html`

---

### Screen 2 — Goal selection
**Reference:** Runna goal selection (11 goals + Continue button at bottom).

**Differentiation chosen:** Pared from 11 to 4 goals matching v1 plan content. Removed Continue button — tap-to-advance via card chevron. Added "Help me choose" 5th card (Claude Design's addition — accepted) for users who don't know their goal. Added "You can change your goal later in settings" microcopy to reduce commitment anxiety.

**Final goals shown:**
1. **Run my first 5K** — "New to running"
2. **Run a faster 5K** — "You can run 5K — want to be quicker"
3. **Build to 10K** — "Comfortable at 5K, going further"
4. **General fitness** — "No goal — just keep running"
5. **Help me choose** (compass icon, optional path)

**v1 plans to seed in Supabase:** First 5K, Faster 5K, Build to 10K, General fitness (2 frequency variants each = 8 plans total).

**KNOWN GAP:** "Help me choose" needs a guided picker screen designed later. For v1.0, can fall back to recommending General Fitness if not implemented in time.

**Sketch file:** `Goal.html` (lives in its own sketch — Claude Design's audit of later sketches won't see this file)

---

### Screen 3 — Running ability
**Reference:** Runna's "How would you rate your running ability?" (4 levels: Beginner, Intermediate, Advanced, Elite — miles only, gym-bro vocabulary like "structured training e.g. intervals").

**Differentiation chosen:** Option 2 (behavior sentences instead of ranked level labels) + 5th "Not sure yet" muted fallback card + Option A path glyph icon system. Dropped "Elite" tier entirely (off-brand for our user). Dual units in descriptions (3K / 2 miles). Plain-English behavior over training vocabulary. Tap-to-advance, no Continue button. No emoji — hand-drawn SVG path glyphs only.

**Final headline:** "Which sounds most like you right now?"
**Microcopy:** "You can change this later."

**Card behavior sentences:**
1. "I'd like to start, but I'm not running yet." → `startingPoint: 0`
2. "I can jog a bit, then I need to walk to catch my breath." → `startingPoint: 1`
3. "I can run about 3K (2 miles) without stopping." → `startingPoint: 2`
4. "I run regularly — 8–10K (5–6 miles) feels comfortable." → `startingPoint: 3`
5. "Not sure yet — I'll figure it out." (muted, 60% opacity) → defaults to `startingPoint: 1` (safest)

**Path glyph icon system introduced here:**
- Card 1: single dot at start of dashed line
- Card 2: broken dashes (stop-start rhythm)
- Card 3: smooth single curve
- Card 4: longer curve with hill
- Card 5: faint dotted exploratory line

**Sketch file:** `Running-ability.html`

---

### Screen 4 — Age bracket
**Reference:** Runna's 3-column DOB picker with "You must be 18 years or older" gate and Continue button.

**Differentiation chosen:** Option A (bracket cards) — replaced DOB with 5 age brackets. Removed "I'd rather not say" 6th card in favor of transparency microcopy. Killed Runna's 18+ gate; replaced with 13+ floor presented as disclosure (no separate gate screen). No path glyphs (typography carries the design — glyphs would read as comments on the user).

**Final headline:** "Roughly how old are you?"
**Subhead:** "We use this to set a safe starting intensity — beginner plans look different at 25 than at 55."

**Card brackets:**
1. **Teens** (13–19) → `ageBucket: 1`
2. **Twenties** (20–29) → `ageBucket: 2`
3. **Thirties** (30–39) → `ageBucket: 3`
4. **Forties** (40–49) → `ageBucket: 4`
5. **Fifty plus** (50+) → `ageBucket: 5`

**Microcopy block (privacy + disclosure):**
- "We use this only to set your starting intensity. Stored on your device, never shared with third parties."
- "Stridey is for ages 13 and up."

**PRIVACY OBLIGATION:** `ageBucket` must be stored ONLY in device-local AsyncStorage. NEVER synced to Supabase `profiles` table. The microcopy promises this — code must honor it. (Supabase schema already excludes this field per `docs/supabase-schema.sql`.)

**Sketch file:** `Age.html`

---

### Screen 5 — Frequency (days per week)
**Reference:** Runna's "How many days per week would you like to run?" (2 / 3 cards + Continue button, with teal selection color).

**Differentiation chosen:** Option C — stacked cards with `WeekStrip` primitive in cadence mode (introduced `WeekStrip` here). "Most popular" data-framed tag on 3-day card (vs paternalistic "recommended" framing). Killed teal selection color drift from reference — primary orange only.

**Final headline:** "How often would you like to run?"
**Subhead:** "Run most weeks. You can adjust anytime."

**Cards:**
1. **2 Days** — "Lighter commitment, slower ramp."
   - WeekStrip: 2 filled dots (no day letters)
2. **3 Days** — "Steady ramp — recommended for your first 5K." [Most popular tag]
   - WeekStrip: 3 filled dots (no day letters)

**Interaction:** Tap-to-select + Continue button (binary choice deserves explicit commit, not auto-advance).

**KNOWN GAP:** 3-day card description hardcodes "first 5K" — must vary by user goal in Claude Code implementation. Copy variants by goal:
- First 5K → "Steady ramp — recommended for your first 5K."
- Faster 5K → "Steady ramp — recommended to improve your 5K time."
- Build to 10K → "Steady ramp — recommended to safely build to 10K."
- General fitness → "Steady ramp — recommended for consistent progress."

**Sketch file:** `Frequency.html`

---

### Screen 6 — Available days
**Reference:** Runna's checkbox list of all 7 days with static validation copy "Please select at least 3 days to continue."

**Differentiation chosen:** Option 1 — live-edit `WeekStrip` as centerpiece. The 7 dots ARE the tap targets, not a separate list. Extended `WeekStrip` API with optional `onToggle(index)` prop for read/write mode. Dynamic min-count validation (matches frequency selected on screen 5). Button-as-feedback-surface for validation ("Pick 1 more day" → "Continue"). Persistent non-reactive spacing microcopy.

**Final headline:** "Which days are you free?"
**Live counter under strip:** "N of M selected" (neutral, not alarming)
**Spacing microcopy:** "Spread your days across the week so your body can recover."

**Interaction:**
- 52dp circular dots in a row with day letters inside (M T W T F S S)
- Tap toggles selected/unselected
- Button text dynamic: "Pick N more day(s)" (disabled) → "Continue" (armed orange) when count met
- No reactive alerts, no "are you sure?" — information not warnings

**Sketch file:** `Availability.html`

---

### Screen 7 — Start date
**Reference:** Runna's start-date screen — Today / Tomorrow (default-selected, with date shown above the label) / Custom (with inline date picker drum). Teal selection color (off-system).

**Differentiation chosen:** Option A — three separate cards in established stack vocabulary. Tomorrow pre-selected with "Recommended" pill (data framing, not paternalistic "we recommend"). Today and Tomorrow show their concrete dates beneath the label (label first, date second — opposite of Runna's order). Custom card has chevron, opens native Material 3 date picker (deferred to Claude Code phase). Killed teal color drift — orange primary only. Dropped the ? help icon.

**Final headline:** "When should we begin?"
**Subhead:** "You can change this anytime."

**Cards:**
1. **Today** — Sun, May 24
2. **Tomorrow** — Mon, May 25 [RECOMMENDED pill, pre-selected]
3. **Pick a date** — Tap to choose [chevron, opens native date picker]

**Live microcopy under cards:** "Plan ends [computed date]." Fades in on selection. Computed from start date + plan duration (which varies by goal + frequency).

**Implementation notes:**
- Plan-end-date calculation is hardcoded in the prototype as an example. In Claude Code phase, must compute live from `userOnboardingStore` state (goal + frequency + start date).
- Custom date picker uses `@react-native-community/datetimepicker` — see Implementation Notes section. Do NOT build a custom inline calendar.
- Date constraint: soft floor at today (no past dates). No upper cap — trust the user.

**Sketch file:** `When-should-we-begin.html` (verify in Claude Design file browser)

---

### Screen 8 — Units (miles or kilometres)
**Reference:** Runna's "Which units would you like your plan to be generated in?" — two options ("Optimized for Miles / Tempo 2mi" and "Optimized for Kilometers / Tempo 3km") + Continue button. Wordy headline, jargon in examples ("Tempo"), 47-word subhead restating the question.

**Differentiation chosen:** Option A — card stack with example session inside each card. Real plan copy as the example ("Easy run · 3 mi" / "Easy run · 5 km") instead of training jargon. Locale-defaulted pre-selection (prototype hardcoded to Miles; Claude Code phase uses expo-localization). Tap-to-advance (reversible decision deserves lightness). Subhead cut entirely. Killed teal selection color.

**Final headline:** "Miles or kilometres?"
**No subhead** — headline + card examples carry the meaning.

**Cards:**
1. **Miles** — Easy run · 3 mi [pre-selected for US/UK/LR/MM locales]
2. **Kilometres** — Easy run · 5 km [pre-selected for everywhere else]

**Bottom microcopy:** "Change later in Settings → Units."

**Implementation notes:**
- Locale check in Claude Code phase — see "Locale-defaulted unit preference" in Implementation Notes section.
- Once units is set here, all downstream screens display in user's preference. Dual-unit displays from earlier screens (e.g. "3K (2 miles)" on ability screen 3) are no longer needed after this point.

**Sketch file:** `Miles-or-kilometres.html` (verify in Claude Design file browser)

---

### Screen 9 — Plan summary (the first hero moment)
**Reference:** Runna's "Your plan is nearly ready!" — photo hero + plan badge + plan name + meta + bullet list of user's selections + "Generate my plan" CTA.

**Differentiation chosen:** Option B — hero photo + unified summary card with WeekStrip in specific-days read-only mode (third deployment of the primitive). No plan badge (restraint — we don't sell plans). No "your plan is ready!" headline (visual carries it). Fixed single screen, no scroll — commit moment requires immediate CTA visibility. Picks not editable in place (back arrow handles revision).

**Plan content shown (v1 example):**
- Plan name: First 5K Plan
- Duration: 8 weeks · Mon, May 25 → Sun, Jul 19
- Stat row: 24 SESSIONS · 30 MIN PER SESSION · MILES UNITS
- "YOUR WEEK" WeekStrip: Mon, Wed, Sat filled (read-only specific-days mode, with day labels)

**CTA:** "Build my plan" — action-as-result, unambiguous

**EXPORT FORMAT NOTE:** Saved as PNG instead of PDF because Claude Design weekly limit was hit before Save as PDF could be used. PNG is sufficient as a design record. Regenerate as PDF and replace `09-plan-summary.png` with `09-plan-summary.pdf` in a later commit when the design limit resets.

**Sketch file:** `Plan-summary.html`

---

### Screen 10 — Building plan loader (with error state)
**Reference:** Runna's "Building your plan" — single circular spinner with small horizontal progress bar, single static headline, no phasing, no error state shown.

**Differentiation chosen:** Option B — WeekStrip animated fill as the loader. Fourth deployment of the WeekStrip primitive (animated mode). User's selected days fill in their selection order (Mon → Wed → Sat) first in orange, then remaining days fill in muted grey. Three phased headlines pacing ~900ms each (total ~2.7s): "Mapping your week" → "Choosing your sessions" → "Calibrating to your pace." Error state designed and rendered (not just spec'd).

**Pacing rules:**
- Target 2.4–3.0s, hard cap 4s
- Real Supabase work (200–500ms) completes inside phase 1
- If network slower than floor, extend final phase only — never early phases
- No skip button (defeats the "carefully crafted" feeling)

**Error state:** 6s soft timeout → broken-line path glyph (callback to trajectory family), "We hit a snag" headline, "Your answers are saved — let's try again" subhead, primary CTA "Retry" (re-fires Supabase call), secondary text-button "Use a starter plan" (falls back to stock template matching user's goal slug).

**Implementation notes:**
- WeekStrip needs a new animated mode (timed fill from selectedDays array, then complete with greyed remainder). Extend week-strip.jsx API with `animateFillFrom: number[]` and `animateRemainderAfter: number` (ms).
- Phased headlines: use React state machine with setTimeout, swap text with crossfade transition.
- Error state separate component but reuses path glyph language.

**Sketch file:** `Building-plan.html` (verify in Claude Design file browser)

---

### Screen 11 — Account creation
**Reference:** None — designed from scratch within Stridey's design system. First screen in onboarding without a Runna reference.

**Differentiation chosen:** Option A — single primary path (Google one-tap), email as text-link disclosure that expands additively (Google button remains visible after email opens). Plan chip at top with mini WeekStrip as the 5th deployment of the primitive — makes the "asset being saved" visible, not just named. Headline "Save your First 5K Plan" reframes account creation as plan protection, not a sign-up wall.

**Default state (email collapsed):**
- Plan chip: "First 5K Plan · 8 weeks" + miniature WeekStrip (Mon/Wed/Sat filled)
- Headline: "Save your First 5K Plan"
- Subhead: "Create an account so your plan syncs and won't get lost."
- T&C microcopy: "By continuing, you agree to our Terms and Privacy Policy." (linked, 12sp, dim)
- Primary CTA: "Continue with Google" (white button, G logo)
- Text link below: "Use email instead"

**Email-expanded state:**
- Same plan chip, headline, subhead
- T&C moves above the Google button
- Google button still visible (additive expansion)
- "Hide email form" toggle to collapse
- Email field (placeholder: "you@email.com")
- Password field (placeholder: "At least 8 characters")
- "Forgot password?" right-aligned under password field
- Primary CTA flips to "Continue with email" (orange)

**Implementation notes:**
- Google sign-in: expo-auth-session + expo-crypto for OAuth flow, Supabase Auth as the backend
- Password rule: 8+ characters, NO complexity regex (NIST 800-63B aligned). Add haveibeenpwned breach check in v1.x
- Forgot password: required for v1, sends Supabase magic link reset email
- No display name collected here — defer to settings screen
- Loading: spinner inside the button (replaces label), not a full-screen overlay
- Errors: toast for auth failures (top of screen), inline-below-field for validation
- Success: no intermediate "Welcome!" screen — advance directly to screen 12 (permissions)
- Apple sign-in deferred to iOS launch (mandatory per Apple's third-party-login rule)

**Sketch file:** `Account-create.html` (verify in Claude Design file browser)

---

### Screen 12 — Permissions (the final screen of onboarding)
**Reference:** None — designed from scratch within Stridey's design system.

**Differentiation chosen:** Option A — one screen with two cards, per-card Allow buttons, bottom Continue button with state-dependent copy. Made permission asymmetry visible without being threatening (Location carries muted "Required" tag, Notifications has none). Soft-block fallback for location refusal (home-screen banner, never hard-block). Respect-the-no for notifications (no in-app re-prompts).

**Three states delivered in build (all visible in export):**
1. DEFAULT — neither asked, both cards in "Allow" state, Continue button muted/disabled
2. BOTH GRANTED — both cards tinted orange with "Granted ✓", Continue armed in primary orange
3. MIXED — one granted, one denied, Continue text flips to "Continue anyway"

**Headline:** "Two last things"
**Subhead:** "We'll ask Android for permission. You can change these anytime in Settings."

**Cards:**
1. **Location** [REQUIRED tag, muted grey]
   - Icon: path glyph (pin marker + route trail)
   - Copy: "Track your runs and map your route."
   - Button states: "Allow location" → "Granted ✓"
2. **Notifications** [no tag]
   - Icon: path glyph (concentric circles, beat metaphor)
   - Copy: "A daily reminder about today's session. No spam."
   - Button states: "Allow notifications" → "Granted ✓"

**Bottom CTA copy logic:**
- "Continue" — when both granted or only Required (location) granted
- "Continue anyway" — when either denied
- Muted/disabled — when neither has been asked yet (force interaction)

**Refusal handling architecture:**
- **Location denied:** Soft-proceed to home. Home screen shows a banner "Enable location to record runs" with tap-to-fix that re-opens the permission flow. Do NOT strip down the home screen — user can still view plan, schedule, etc.
- **Notifications denied:** Soft-proceed silently. NEVER re-prompt in-app. Re-enable path exists only via Settings → Profile → Notifications.
- **Both denied:** Same as above — let them in.

**Implementation notes for Claude Code phase:**
- Android 13+ requires runtime POST_NOTIFICATIONS permission; older Android grants implicitly
- Location: ACCESS_FINE_LOCATION only (precise, not approximate)
- Do NOT request ACCESS_BACKGROUND_LOCATION in v1 — avoids Play Store background-location justification flow and keeps Privacy Policy simple
- Libraries: `expo-location` for GPS permission, `expo-notifications` for push permission
- After this screen advances, navigate to `/home` (replace, don't push — onboarding stack should be cleared from history)
- Persist permission grant state to AsyncStorage so the app knows on cold-start which permissions were ever granted

**Sketch file:** `Permissions.html` (verify in Claude Design file browser)

## Reusable Design Primitives

### WeekStrip
**Introduced:** Screen 5 (frequency) in cadence mode.
**Extended:** Screen 6 (available days) added specific-days mode + `onToggle(index)` prop for interactive use.
**Component file in Claude Design project:** `week-strip.jsx` with full JSDoc.

**API:**
```
filled: number             // cadence mode — count of filled dots
days: boolean[7]           // specific-days mode — which days selected
selected: boolean          // visual highlight for selected card context
primary: string            // primary color override (defaults to orange)
palette: object            // optional color palette override
showLabels: boolean        // M T W T F S S above dots
dotSize: number            // dot diameter in dp
gap: number                // gap between dots in dp
onToggle(index): function  // optional — when present, dots become tap targets
```

**Three modes:**
1. **Cadence (read-only):** pass `filled` only — shows rhythm
2. **Specific-days (read-only):** pass `days` + `showLabels: true` — shows which days
3. **Specific-days (read/write):** also pass `onToggle` — dots become interactive

**Used in:** screens 5, 6. **Planned use:** plan summary, home dashboard, plan detail view, weekly progress, history.

---

### Card stack
**Introduced:** Screens 3 (ability) and 4 (age).

- **Standard height:** 88dp for typography-only cards
- **Tall variant:** 96dp for cards with extra content (e.g. embedded WeekStrip, description + tag)
- **Selection state:** orange (primary) border, orange checkmark on the right, slightly elevated background
- **Interaction:** tap-to-advance on multi-choice screens, tap-to-select + Continue on binary screens

**Used across:** screens 2, 3, 4, 5 (binary variant).

---

### Path glyph icons
**Introduced:** Screen 3 (running ability cards).

- **Style:** hand-drawn SVG, trajectory family (paths, lines, dots, curves representing motion or rhythm)
- **Continuity:** visual link to welcome screen's "journey/path" feel
- **Use when:** a screen benefits from a visual rhythm cue or motion metaphor
- **Skip when:** the metaphor would read as a comment on the user (e.g. age brackets — typography carries those better)

**Used in:** screen 3. Available for future screens.

---

### Top chrome
**Introduced:** every onboarding screen (welcome onwards).

- **Layout:** back arrow (left), progress bar (center, N/12 of onboarding), close X (right)
- **Welcome exception:** no progress bar visible (pre-onboarding)
- **Progress bar style:** thin horizontal, orange fill on dark grey track, animates forward on screen advance
- **Close X behavior:** confirms with "Quit setup? Your progress will be saved." (TBD — implementation detail for Claude Code phase)

---

## Implementation Notes (for Claude Code phase)

### Cross-screen state
Onboarding has cross-screen dependencies. Multiple screens read user state collected on earlier screens:
- Screen 5 (frequency) reads screen 2 (goal) for description copy
- Screen 6 (available days) reads screen 5 (frequency) for min-validation count
- Screen 9 (plan summary) reads ALL prior screens to display selections
- Plan generator (post-onboarding) needs the complete state object

**Recommended stack:**
- **Zustand store:** `useOnboardingStore` with all collected state
- **AsyncStorage persistence:** so users can resume mid-onboarding
- **On final screen confirmation:** write state to Supabase `profiles` + `user_plans` tables, then clear AsyncStorage
- **The `ageBucket` field MUST NOT sync to Supabase** per privacy promise on screen 4 (device-only)

### Component extraction priorities
Build these as standalone shared components from day one in Claude Code:
1. `<WeekStrip />` — cadence + specific-days modes, read/write
2. `<OnboardingCard />` — 88/96dp height variants, selection states
3. `<TopChrome />` — back/progress/close header
4. `<PathGlyph />` — accepts a glyph name, renders the corresponding SVG

### Copy variants by goal
Several screens have copy that varies based on the user's screen-2 goal selection. Build a shared copy-by-goal helper rather than hardcoding strings:
- Screen 5 frequency description (see Screen 5 KNOWN GAP above)
- Plan recommendation screen (when designed)
- Plan summary screen

### Date pickers
Use @react-native-community/datetimepicker for Custom date selection on screen 7 (Start date). It wraps the native Android Material 3 date picker on Android and the iOS spinner on iOS. Do NOT build a custom inline calendar component — the native dialog is accessible, well-tested, and free.

### Locale-defaulted unit preference
Screen 8 (Units) defaults to Miles or Kilometres based on device locale. 
In Claude Code phase use expo-localization:
  import * as Localization from 'expo-localization';
  const region = Localization.getLocales()[0]?.regionCode;
  const defaultUnit = ['US', 'GB', 'LR', 'MM'].includes(region) ? 'mi' : 'km';
The prototype hardcodes Miles as default — replace with the above 
check at implementation time.
---
### Authentication
v1 ships with Email + Google sign-in via Supabase Auth. Account required to use the app. Apple sign-in added at iOS launch time (mandatory per Apple's rule: any third-party social login requires Apple sign-in alongside it). Library: @supabase/supabase-js for the client, expo-auth-session + expo-crypto for Google OAuth flow.


## Deferred to v1.0.1 or Later — Do Not Forget

### Onboarding screens deferred
- **Gender selection** → v1.1 settings/profile screen
- **Injury history** → v1.1, with "training plans are not medical advice" disclaimer
- **Activity level** → DROPPED (redundant with ability screen 3)
- **Plan length question** → DROPPED (auto-calculate from goal + days/week)
- **Plan finish date question** → DROPPED (derived from start date + plan length)

### Product features deferred
- **Postpartum, parkrun, functional fitness, race training, ultramarathon plans** → v1.2+
- **"Help me choose" guided picker** (from goal screen) → v1.1, currently stubs to General Fitness fallback
- **Apple Watch / Wear OS integration** → v2.0
- **Social / friends / leaderboards** → v2.0 or never (deliberate choice against)
- **Ads** → v1.1+ (declare in Play Store / App Store listings BEFORE adding)

### Post-launch rules (committed at project start)
- **v1.0.1** = bug fixes + top user-requested feature only
- **v1.0.2** = bug fixes + next top user-requested feature
- Major features go in v1.1, v1.2, etc., not in patch releases
- Primary path: Google sign-in (Android one-tap via expo-auth-session)
- Secondary path: Email + password (Supabase Auth direct)
- Password rule: 8+ characters, no complexity regex (NIST 800-63B aligned)
- Forgot password: required for v1, surfaced as text link under password field
- No display name collected during signup; profile naming deferred to settings screen later
- T&C / Privacy Policy links surfaced above primary CTA (legal requirement)
---

## How to maintain this file

After every completed design screen:
1. Add an entry under "Screen-by-Screen Decisions" using the same format as screens 1–6
2. If a new shared primitive was introduced, add it under "Reusable Design Primitives"
3. If a new implementation concern came up, note it under "Implementation Notes"
4. Commit with message: `docs: log screen N decisions`

After every architectural pivot or scope change:
1. Add an entry to "Pivot Log" with the date and what changed
2. Update relevant screen entries if the pivot affects them
3. Update "Deferred" list if scope changed
4. Commit with message: `docs: pivot — short description`

---

## Known dev quirks (web preview only)

- **`Alert.alert` may not render in web preview.** Used by goal.tsx's `confirmQuit` handler on the close X. Works on real iOS/Android builds; react-native-web silently no-ops in some setups. Not a bug — accept until tested on a device.
- **Deep-route browser refresh resets the navigation stack.** Refreshing the browser on `/(onboarding)/ability` (or any non-root onboarding screen) leaves the stack empty, so back arrow throws "GO_BACK was not handled." Dev-only warning, doesn't occur in production. When building real screens 3+, guard back handlers with `router.canGoBack()` and fall back to an explicit `router.replace` to the appropriate previous screen.
