# CLAUDE.md — Questionnaire_Site

Build-specific guidance for the VRpatients persona questionnaire. This is a subfolder of the VRpatients-Brand-Foundation project but has its own git repo so Netlify can deploy it independently.

## What this is

- Static site — HTML/CSS/JS only. No backend, no framework, no build step.
- Hosted on Netlify.
- Form submissions handled via **Netlify Forms**: the form tag must include `data-netlify="true"` (and a `name` attribute). Netlify intercepts the POST at deploy time.

## Brand reference — LOCKED DECISIONS

**Color palette:** Final (locked 2026-05-25). Was Reef — retired (competitor color space). See `../../../visual-direction/working/design-options.md` for the canonical palette doc, semantic name meanings, and historical exploration.
**Font:** Plus Jakarta Sans (Google Fonts CDN)
**Design system influence:** IBM Carbon Design System (spacing, component patterns, grid philosophy)

All colors use CSS custom properties on `:root`. The variable names below were kept from the original Reef build to avoid touching every selector in `styles.css`; the *values* they resolve to are now the Final palette.

| Token | Value | Final palette name | Usage |
|-------|-------|--------------------|-------|
| `--color-primary-dark` | `#060D24` | **Onset** | Text, headers, dark backgrounds |
| `--color-primary-blue` | `#0052CC` | **Intervene** | Buttons, progress bar, primary CTAs |
| `--color-accent` | `#76B900` | **Stable** | Interactive highlights, completion badges, success states |
| `--color-surface` | `#E4EEF6` | **Bay** | Section backgrounds |
| `--color-white` | `#FFFFFF` | **Sterile** | Card backgrounds, primary surfaces |
| `--color-blue-powder` | `#A8CDDF` | **Drape** | Reserved for future soft-secondary use; not yet referenced in `styles.css` |
| `--color-amber` | `#C2410C` | — | Validation errors (functional, outside brand palette) |

### Confidence-tag color semantics

- `BEDROCK` → `--color-accent` (now Stable green — semantically aligned: "you got it right")
- `CRM-BACKED` → `--color-primary-blue` (Intervene)
- `ASSUMPTION` → `--color-amber`

## Build instructions

The L5 build prompt is in `L5_BUILD_PROMPT.md`. It contains the complete implementation spec including all design direction extracted from Lindsey's reference images. **Read it before writing any code.**

The L4 question spec is at `../L4_QuestionnaireSpec.md` — it is the authoritative source for question text, validation rules, routing logic, and submission data schema.

Reference images are at `../../../visual-direction/working/reference-images/` (1–8.png, A–D.png). Study them — especially `4.png` for UI component structure.

**Plan first, then build.** Present a structural plan before writing HTML/CSS/JS.
