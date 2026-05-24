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

**Sketch file:** `Available-days.html` *(update with final sketch ID once exported)*

---

### Screens 7–12 — Pending
- 7: Start date (Today/Tomorrow/Custom)
- 8: Units (km/mi)
- 9: Plan summary
- 10: Building plan loader
- 11: Account creation (no Runna reference — design from scratch)
- 12: Permissions — location + notifications (no Runna reference — design from scratch)

---

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

---

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
