# CLAUDE.md — Questionnaire_Site

Build-specific guidance for the VRpatients persona questionnaire. This is a subfolder of the VRpatients-Brand-Foundation project but has its own git repo so Netlify can deploy it independently.

## What this is

- Static site — HTML/CSS/JS only. No backend, no framework, no build step.
- Hosted on Netlify.
- Form submissions handled via **Netlify Forms**: the form tag must include `data-netlify="true"` (and a `name` attribute). Netlify intercepts the POST at deploy time.

## Brand reference — LOCKED DECISIONS

**Color scheme:** `Reef` (teal accent)
**Font:** Plus Jakarta Sans (Google Fonts CDN)
**Design system influence:** IBM Carbon Design System (spacing, component patterns, grid philosophy)

All colors use CSS custom properties on `:root` so palette swaps are trivial. See `L5_BUILD_PROMPT.md` for the full token list.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-dark` | `#060d24` | Text, headers, dark backgrounds |
| `--color-primary-blue` | `#0052cc` | Buttons, progress bar, primary CTAs |
| `--color-accent` | `#00b8d9` | Teal — interactive highlights, badges, completion |
| `--color-surface` | `#eaf4ff` | Section backgrounds |
| `--color-amber` | `#C2410C` | Validation errors |
| `--color-white` | `#ffffff` | Card backgrounds, primary surfaces |

### Other schemes (for future palette swaps)

| Scheme | Accent hex | Surface hex |
|--------|-----------|------------|
| `Legacy` | `#0C70AE` / `#6BB544` | white |
| `Evergreen` | `#76b900` | `#f4f6f8` |
| `Powder` | `#a8cddf` | `#eef5fa` |

### Confidence-tag color semantics

- `BEDROCK` → `--color-accent` (teal in Reef)
- `CRM-BACKED` → `--color-primary-blue`
- `ASSUMPTION` → `--color-amber`

## Build instructions

The L5 build prompt is in `L5_BUILD_PROMPT.md`. It contains the complete implementation spec including all design direction extracted from Lindsey's reference images. **Read it before writing any code.**

The L4 question spec is at `../L4_QuestionnaireSpec.md` — it is the authoritative source for question text, validation rules, routing logic, and submission data schema.

Reference images are at `../../../visual-direction/working/reference-images/` (1–8.png, A–D.png). Study them — especially `4.png` for UI component structure.

**Plan first, then build.** Present a structural plan before writing HTML/CSS/JS.
