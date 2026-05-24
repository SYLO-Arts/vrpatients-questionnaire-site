# CLAUDE.md — Questionnaire_Site

Build-specific guidance for the VRpatients persona questionnaire. This is a subfolder of the VRpatients-Brand-Foundation project but has its own git repo so Netlify can deploy it independently.

## What this is

- Static site — HTML/CSS/JS only. No backend, no framework, no build step.
- Hosted on Netlify.
- Form submissions handled via **Netlify Forms**: the form tag must include `data-netlify="true"` (and a `name` attribute). Netlify intercepts the POST at deploy time.

## Brand reference

**Before building, ask Sylo which color scheme to use.** Four named schemes are defined in `brand/visual-direction/working/design-options.md`. The scheme determines all color tokens.

| Scheme | Primary accent | Secondary accent | Background surface |
|--------|---------------|-----------------|-------------------|
| **`Legacy`** | `#0C70AE` (blue) | `#6BB544` (green) | white |
| **`Evergreen`** | `#0052cc` (blue) | `#76b900` (lime green) | `#f4f6f8` |
| **`Powder`** | `#0052cc` (blue) | `#a8cddf` (powder blue) | `#eef5fa` |
| **`Reef`** | `#0052cc` (blue) | `#00b8d9` (teal) | `#eaf4ff` |

All non-Legacy schemes share Primary Dark `#060d24` for text/headers.

### Typography

**Ask Sylo which font to use.** Four candidates — see `brand/visual-direction/working/design-options.md`. If no direction is locked, default to Arial (Legacy).

### Confidence-tag color semantics

These map to the active scheme's accent colors:
- `BEDROCK` → success/green accent (Legacy: `#3F7A1F`, others: scheme's secondary)
- `CRM-BACKED` → primary blue accent (Legacy: `#0C70AE`, others: `#0052cc`)
- `ASSUMPTION` → warn amber `#C2410C` (shared across all schemes)

## Workflow expectation

Implementation work arrives in a separate prompt later. That prompt expects **plan mode first, then execution**. Do not write HTML/CSS/JS in this scaffolding pass — wait for the L5 implementation prompt.
