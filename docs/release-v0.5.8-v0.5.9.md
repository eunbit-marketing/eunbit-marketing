# Bloom v0.5.8-v0.5.9 Release Notes

This release groups two larger pilot-readiness updates:

- v0.5.8: pilot feedback and inquiry flow
- v0.5.9: copy-ready banner text templates inside the one-click marketing kit

## v0.5.8 Pilot Feedback Flow

Implemented:

- Added "피드백 남기기" from the home header.
- Added "파일럿 신청/피드백" CTA to the proposal page header and hero.
- Added a new proposal section for 30-second feedback, share text, and pilot criteria.
- Added a feedback modal that captures:
  - store name,
  - category,
  - most-needed feature,
  - price reaction,
  - free-form notes.
- Feedback is stored locally in `state.pilotFeedback`.
- Settings now includes a "파일럿 피드백 기록" panel showing the latest saved reactions.
- Added a copyable pilot invite message for sharing Bloom with other owners.

Why it matters:

Pilot outreach needs a loop. Before auth, database, or CRM exists, local feedback capture gives the owner a way to record reactions during demos and 1:1 conversations.

## v0.5.9 Banner Text Templates

Implemented:

- Added `bannerTemplates` to normalized marketing kits.
- Generated three copy-ready banner variants for each kit:
  - soft first-screen notice,
  - bold benefit emphasis,
  - local regular-customer style.
- The live AI kit result now renders banner template cards.
- Clicking a banner template copies its headline, subline, and CTA.
- Saved kit bundles also show compact banner chips and support one-click banner copy.
- Full kit copy now includes the banner text section.

Why it matters:

Small-business owners often need more than long-form copy. A banner headline or image overlay text is one of the fastest pieces of marketing material they can reuse in Instagram images, Naver Place images, Kakao messages, and simple flyers.

## Verification

- `git diff --check` passed.
- Local static server responded with `200`.
- `assets/js/app.js` imports successfully in a browser-stubbed Node REPL environment.
- Production should be verified after push by confirming the live HTML includes `파일럿 신청/피드백`, `pilot-cta-grid`, and banner template markup.
