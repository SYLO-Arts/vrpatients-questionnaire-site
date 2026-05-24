# L5 Build Prompt — VRpatients Persona Questionnaire

**Purpose:** Build the L5 HTML questionnaire form from the L4 spec.
**Target:** Claude Code (VS Code), working in `brand/personas/working/Questionnaire_Site/`
**Date:** 2026-05-24

---

## Context

You are building an internal team questionnaire for VRpatients' brand foundation project. This is a static HTML/CSS/JS site deployed on Netlify. The form captures structured data from 5–15 named team members about customers, prospects, and competitive positioning. Form submissions are handled by Netlify Forms (`data-netlify="true"` on the `<form>` tag).

**Read before building:**
- `CLAUDE.md` in this directory — site-level constraints
- `../L4_QuestionnaireSpec.md` — the full question spec (this prompt summarizes it, but the spec is authoritative)
- `../../../visual-direction/working/reference-images/` — Lindsey's 12 design reference images (study all of them, especially `4.png` for UI component structure)
- `../../../visual-direction/working/design-options.md` — color scheme and font definitions

---

## Decisions Locked for This Build

| Decision | Value |
|----------|-------|
| **Color scheme** | `Reef` — teal accent |
| **Font** | Plus Jakarta Sans |
| **Design system influence** | IBM Carbon Design System (use its spacing, component patterns, and grid philosophy — not a full Carbon import, just the design language) |
| **Palette swap** | All colors must be CSS custom properties on `:root`. Swapping to Evergreen, Powder, or Legacy should require changing only the `:root` block. |

### Reef Color Tokens

```css
:root {
  /* Reef scheme */
  --color-primary-dark: #060d24;
  --color-primary-blue: #0052cc;
  --color-accent: #00b8d9;        /* Teal — the Reef differentiator */
  --color-surface: #eaf4ff;
  --color-white: #ffffff;
  --color-amber: #C2410C;         /* Validation errors */
  
  /* Derived / UI tokens */
  --color-text: #060d24;
  --color-text-secondary: #4a5568;
  --color-border: #d1d9e0;
  --color-input-bg: #ffffff;
  --color-section-bg: #eaf4ff;    /* Surface for alternating sections */
  --color-success: #00b8d9;       /* Completion, confirmation states */
  --color-button-primary: #0052cc;
  --color-button-hover: #003d99;
  --color-progress: #0052cc;
  --color-skip-button: #6b7280;
  --color-skip-hover: #4b5563;
}
```

### Typography

**Font:** Plus Jakarta Sans (variable weight). Load from Google Fonts CDN:
```
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap
```

**Weight hierarchy (IBM Carbon-influenced):**
- Page title / form header: ExtraBold (800)
- Section headers: Bold (700)
- Subsection / question labels: SemiBold (600) or Medium (500)
- Body / option text: Regular (400)
- Helper text / captions: Regular (400), smaller size, secondary color

**Scale:** Use IBM Carbon's type scale philosophy — base 14–16px body, heading steps at 1.25–1.5x increments. Don't go below 14px for any readable text.

---

## Design Direction — What Lindsey's Reference Images Tell Us

Study all 12 reference images in `../../../visual-direction/working/reference-images/`. The key takeaways for this build:

**From image 4 (Anthony's favorite) — UI component structure:**
- Dark navy (`--color-primary-dark`) for the page header/nav area
- White cards on the light surface background for form sections
- Accent color (teal in Reef) for interactive highlights, badges, active states
- Primary blue for CTAs and buttons
- Clean separation between sections using background color shifts
- Professional, clinical healthcare aesthetic — not playful, not corporate-stiff

**From images 2, 5, 6 — hero/landing feel:**
- Dark navy backgrounds with white text for high-impact areas (use for the form intro)
- Green/teal accent on the "Day One." tagline — apply this accent-pop treatment to key elements
- VRpatients logo treatment on dark backgrounds

**From image 7 — logo color variants:**
- Three logo treatments shown with different blue pairings
- The teal pairing (#00b8d9) is the Reef version — matches our scheme

**From images 3 and 8 — brand palette display:**
- Core palette: #060d24, #0052cc, #76b900 (Evergreen) or teal equivalent, #ffffff
- These should feel like a natural extension when looking at the form

**From image 4 — right side, design rationale:**
- Blue-dominated apps show higher retention in healthcare contexts
- Dark blue signals trust, stability, competence
- This is a healthcare/med-ed tool — lean into that institutional confidence

**Overall design language:**
- Clean, spacious, professional
- White content cards floating on the light surface
- Dark navy for headers/hero areas
- Generous padding (IBM Carbon 8px grid: 16px, 24px, 32px, 48px increments)
- Rounded corners on cards (8px) and buttons (6–8px)
- Subtle shadows on cards (not heavy drop shadows)
- No decorative imagery — the form should feel like a well-designed enterprise tool

---

## Technical Requirements

### Stack
- **Static site:** HTML + CSS + vanilla JS. No framework, no build step, no npm.
- **Form backend:** Netlify Forms. The `<form>` tag must have `data-netlify="true"` and a `name` attribute.
- **Files to create:**
  - `index.html` — the form page
  - `styles.css` — all styles
  - `app.js` — form logic (routing, validation, conditional fields, progress tracking)

### Form Structure

The form has 5 sections displayed as steps. The user navigates between them with Next/Back buttons. Only one section is visible at a time.

```
Section 0: Intro + Role Select + Exposure Matrix (~90 sec)
Section 1: Cross-Role Rankings (~2 min)
Section 2: Role-Specific Battery (~3-4 min, or skipped for OTHER)
Section 3: Open-Text Catchall (~90 sec)
Section 4: Interview Booking + Submit (~30 sec)
```

### Progress Indicator

A step-based progress bar at the top. For OTHER-role respondents who skip Section 2, either compress the progress bar to 4 steps or show Section 2 as auto-completed/skipped.

Use `--color-progress` (primary blue) for the filled portion.

### URL Parameter Support

Support `?name=FirstName` to pre-fill the respondent name field (S0_01).

### Mobile

Fully responsive. On mobile:
- The forced-rank (S1_01) should use number-assign dropdowns, not drag-to-reorder
- Matrix questions stack vertically if needed
- Minimum touch target: 44px

### Accessibility

- All inputs have associated `<label>` elements
- Radio groups use `<fieldset>` + `<legend>`
- Skip buttons are `<button>` elements (not links)
- After section transition, focus moves to the first input in the new section
- Color is never the sole indicator (validation errors use text + icon + color)
- WCAG AA contrast on all text

---

## Section-by-Section Specification

### SECTION 0 — Intro + Role Select + Exposure Matrix

**Intro area** (dark navy background, white text — inspired by images 2/5/6):

> **VRpatients Persona Validation — Internal Team Input**
>
> This form captures your direct knowledge about VRpatients' customers, prospects, and market position. It takes 8–10 minutes. At the end, you'll book a 20-minute follow-up conversation where we dig into your answers. Both parts matter.
>
> **One ground rule:** Leaving a question blank is better than guessing. If you don't have direct knowledge on a question, use the skip button. A confident wrong answer from a small team does more damage than a gap we can name.

**Questions:**

**S0_01 — "Your name"**
- Text input, required, min 2 chars
- Pre-fill from `?name=` URL param

**S0_02 — "Which role best describes where you spend most of your time?"**
- Radio buttons: PM (Product/Engineering), SALES (Sales/Business Development), CS (Customer Success/Support/Onboarding), OTHER (Other — specify below)
- If OTHER → show text field "Your role:" (required, min 3, max 100 chars)
- This value determines Section 2 routing

**S0_03 — "Do you also have significant direct knowledge relevant to other roles?"**
- Checkboxes: show the 2 roles NOT selected in S0_02 (from PM, SALES, CS). If OTHER, show all 3.
- Optional — zero or more

**S0_04 — "How much direct interaction do you have with each of these customer/prospect types?"**
- Matrix: 6 rows × 3 radio columns
- Rows: Tech-Hat Tasha (Scenario Author / Sim-Lab Tech), Pass-Rate Paula (Faculty Instructor — Nursing), Director Dale (Economic Buyer — EMS/Nursing), Care-Plan Carla (Nursing Student Learner), Recert-Clock Riley (EMS Professional Learner), Ghosting Greg (Skeptic / Non-Buyer)
- Columns: Heavy (regular, direct interaction) · Some (occasional or indirect) · Little or none
- Required — every row must have exactly one selection
- Render persona names bold with parenthetical subtitle in regular weight

### SECTION 1 — Cross-Role Rankings

All 4 questions mandatory for all respondents.

**S1_01 — Persona strategic importance ranking**
- "Rank these six personas from 1 (most critical to revenue growth in the next 12 months) to 6 (least critical)."
- Forced rank: drag-to-reorder on desktop, number-assign dropdowns on mobile
- Items: Tech-Hat Tasha, Pass-Rate Paula, Director Dale, Care-Plan Carla, Recert-Clock Riley, Ghosting Greg
- All 6 must be ranked, no ties

**S1_02 — "Which ONE persona's engagement or disengagement most determines whether accounts renew?"**
- Radio buttons: same 6 personas
- Required, exactly one

**S1_03 — Skeptic resolution**
- "The persona slate includes a 'Skeptic' non-buyer (Ghosting Greg). In your experience, is the skeptic/non-buyer:"
- Radio buttons: (a) A specific, identifiable person with a consistent title/role who blocks deals · (b) A stance that buyers in other persona categories sometimes adopt during evaluation · (c) Not a useful category — deals die for structural reasons, not a "skeptic"
- If (a) → show text field "What's the typical title or role?" (optional, max 100 chars)
- Required

**S1_04 — Authoring tool temperature**
- "How do prospects and customers experience the authoring tool?"
- Radio: (a) Strongest differentiator — wins deals · (b) Sells well but requires meaningful onboarding support · (c) Neutral · (d) Creates friction that sometimes costs deals · (e) Net negative — lose more than win
- Required

### SECTION 2 — Role-Specific Battery

**Routing:** S0_02 value determines which battery is shown. OTHER skips entirely.

**Section intro copy** (shown above the battery):
> The next questions are specific to your role. Answer from direct experience. If a question is outside your knowledge, use the "Skip — no direct knowledge" button — don't guess.
>
> For text answers: *optionally tag your source — **D** = direct from a customer, **I** = indirect from a colleague, **G** = gut / experience.*

**Evidence-marker helper text** (appears below every free-text input in Section 2):
> *Optionally tag your source: **D** = direct from a customer, **I** = indirect from a colleague, **G** = gut / experience.*

#### SALES Battery (6 questions)

See `L4_QuestionnaireSpec.md` Section 2, SALES BATTERY for full question text, option text, conditional fields, and validation rules.

Questions: S2_SALES_01 through S2_SALES_06
- 01–03: Mandatory
- 04–06: Skip-permitted (show "Skip — no direct knowledge" button)

#### CS Battery (6 questions)

See `L4_QuestionnaireSpec.md` Section 2, CS BATTERY.

Questions: S2_CS_01 through S2_CS_06
- 01–03: Mandatory
- 04–06: Skip-permitted

**Small-N advisory:** Log `cs_skip_alert: true` if any CS question is skipped (hidden field in form data).

#### PM Battery (5 questions)

See `L4_QuestionnaireSpec.md` Section 2, PM BATTERY.

Questions: S2_PM_01 through S2_PM_05
- 01–02: Mandatory
- 03–05: Skip-permitted

**Small-N advisory:** Log `pm_skip_alert: true` if any PM question is skipped (hidden field in form data).

### SECTION 3 — Open-Text Catchall

**Intro copy:**
> Almost done. Two open questions — the first is the single most valuable thing you can contribute. Write what you know, even if it's fragments.

**S3_01 — Customer voice: actual language**
- "What phrases or sentences do customers actually use to describe VRpatients — positive or negative? We want their exact words, not paraphrases. Even fragments help."
- Textarea, 6–8 rows
- Required, min 20 chars
- Evidence-marker helper text

**S3_02 — Pushback invitation**
- "What's the single most important thing about our customers or competitive position that you believe the rest of the team doesn't fully appreciate?"
- Textarea, 4–6 rows
- Optional, no minimum
- Evidence-marker helper text

### SECTION 4 — Interview Booking + Submit

**Intro copy:**
> **Last step.** Based on your answers, we'd like to schedule a 20-minute follow-up conversation to dig into the details. This is where the real value gets captured.

**S4_01 — Interview availability**
- "When are you available for a 20-minute follow-up in the next two weeks?"
- Textarea, 2–3 rows
- Placeholder: "e.g., 'Tuesday/Thursday afternoons work best' or 'anytime next week except Wednesday'"
- Required, min 5 chars

**S4_02 — Submit**
- Button: "Submit & book interview"
- On success, render confirmation inline (don't redirect):
  > "Thank you. Your answers are recorded. Anthony will reach out to book your 20-minute follow-up based on your availability. If you think of anything else, reply to the original message that sent you here."
- Confirmation area uses accent color and primary blue for visual confirmation

---

## Skip Button Behavior

Skip-permitted questions show a styled "Skip — no direct knowledge" button below the question.

When clicked:
- The question is visually marked as skipped (subtle visual treatment — don't make it look like an error)
- The form can advance
- A hidden field logs `SKIPPED_NO_KNOWLEDGE` for that question ID
- The skip is recorded in the submission data

**Skip button styling:** Secondary/muted style — not the same prominence as the primary CTA. Use `--color-skip-button` / `--color-skip-hover`. Should look intentional but not like the "right" answer.

---

## Validation UX

- Validate on section advance (when user clicks "Next"), not on blur
- Show all errors for the current section at once
- Error messages appear below the relevant field
- Error styling: amber (`--color-amber`) border on the field, error text in amber, and an error icon (simple SVG inline)
- Scroll to the first error on the page
- Never use color alone as the error indicator

---

## Hidden Fields for Submission Data

Include hidden fields that get submitted with the form:

```html
<input type="hidden" name="section2_battery" value="">  <!-- PM|SALES|CS|null -->
<input type="hidden" name="primary_role_other" value=""> <!-- text or empty -->
<input type="hidden" name="skipped_questions" value="">  <!-- comma-separated IDs -->
<input type="hidden" name="pm_skip_alert" value="false">
<input type="hidden" name="cs_skip_alert" value="false">
```

Update these via JS as the user progresses through the form.

---

## Implementation Plan

**Plan first, then build.** Before writing any code:

1. Review all reference documents listed above
2. Outline the HTML structure (sections, form groups, conditional blocks)
3. Outline the CSS architecture (custom properties, component classes, responsive breakpoints)
4. Outline the JS architecture (section navigation, routing, validation, skip handling, conditional fields)
5. Present the plan for review

Then build:
1. `styles.css` — full stylesheet with all tokens, components, and responsive rules
2. `index.html` — complete form markup
3. `app.js` — all interactivity
4. Test locally, verify all routing paths work, check mobile layout

---

## What NOT to Do

- No npm, no framework, no build step
- No external dependencies beyond Google Fonts
- No Calendly integration (free text for availability is fine)
- No animated transitions between sections (simple show/hide is fine; subtle fade optional)
- No decorative images or illustrations
- Do not override Netlify Forms behavior — standard POST submission
- Do not create separate pages — single-page form with section show/hide
