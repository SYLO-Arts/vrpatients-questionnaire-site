# VRpatients Questionnaire Site

Internal questionnaire for the VRpatients Brand Foundation (Phase C / Personas Layer 4). Static HTML/CSS/JS, hosted on Netlify, submissions via Netlify Forms, interview booking via Calendly.

## Files

- `index.html` — single-page form, all 5 sections in DOM
- `styles.css` — Reef palette as `:root` tokens, IBM Carbon spacing
- `app.js` — section routing, validation, skip handling, drag-to-rank
- `netlify.toml` — Netlify config (no build step)
- `.claude/launch.json` — local preview config

See `L5_BUILD_PROMPT.md` for the full build spec and `../L4_QuestionnaireSpec.md` for the authoritative question spec.

## Local preview

```
python -m http.server 8765
```

Then open `http://localhost:8765/`. Form POSTs return 501 locally (python's server has no POST) — the app's JS handles this and shows the confirmation panel so the UI can still be tested.

## Production setup checklist

Three things to wire up before going live. None require code changes — all configured externally.

### 1. Deploy to Netlify

- Push the `feat/l5-build` branch to GitHub (under SYLO-Arts) and merge to `main` when ready.
- In Netlify: **Add new site → Import from GitHub →** pick this repo. No build command, publish directory `.`. Netlify auto-detects the form on first deploy.
- Custom domain optional. The default `*.netlify.app` URL works fine for a named-distribution form.

### 2. Replace Calendly placeholder URL

In `index.html`, find this block in Section 4:

```html
<div class="calendly-inline-widget"
     data-url="https://calendly.com/YOUR-HANDLE/vrp-interview?hide_event_type_details=1&hide_gdpr_banner=1"
```

Replace `YOUR-HANDLE/vrp-interview` with your real Calendly event slug. Calendly setup:

1. Sign up at calendly.com (free tier is fine).
2. Connect your Google Calendar (or Outlook).
3. Create a new **Event Type → One-on-One → 20 minutes**, name it "VRpatients Interview" or similar.
4. Set availability rules (e.g., Tue/Thu 1–5pm, 15-min buffer).
5. Copy the event link (looks like `calendly.com/yourname/vrp-interview`).
6. Paste it into the `data-url` above and commit.

The query params `hide_event_type_details=1&hide_gdpr_banner=1` give a cleaner inline look — keep them.

### 3. Slack submission notifications

After the first form submission has been received by Netlify (this is required — Netlify won't show form-config options until at least one submission exists):

1. In Netlify: **Site settings → Forms → Form notifications → Add notification → Outgoing webhook**.
2. Event: "New form submission".
3. URL: a Slack [incoming webhook URL](https://api.slack.com/messaging/webhooks) — create one in your Slack workspace pointing at the channel of your choice (e.g., `#vrp-questionnaire`).
4. Save. Every submission now posts to that channel.

Alternative: Netlify's built-in **Slack** integration (Site settings → Build & deploy → Slack notifications) covers build events, not form submissions. Use the webhook approach above for form data.

## Form submission data

Each submission produces fields per the schema in `../L4_QuestionnaireSpec.md` section 5. Key tracking fields:

- `section2_battery` — `PM` / `SALES` / `CS` / empty (for OTHER)
- `primary_role_other` — free text if role = OTHER
- `skipped_questions` — comma-joined list of question IDs skipped via the "Skip — no direct knowledge" button
- `pm_skip_alert` — `true` if any PM-battery question was skipped (P0 interview routing flag)
- `cs_skip_alert` — `true` if any CS-battery question was skipped (P0 interview routing flag)
- `submitted_at` — ISO-8601 timestamp
- `S1_01_rank` — comma-joined ordered list of persona slugs from the drag-to-rank widget

Export from **Netlify dashboard → Forms → vrp-questionnaire → Download as CSV/JSON** for downstream analysis.

## Distribution

Send each named respondent a personal link like:

```
https://your-site.netlify.app/?name=Tyler
```

The `?name=` query parameter pre-fills S0_01. The respondent list (as of 2026-05-24) is in `../L4_QuestionnaireSpec.md` section 1.2.
