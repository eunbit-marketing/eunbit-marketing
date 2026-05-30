# Bloom v0.5.0 Release Notes

Date: 2026-05-31

## Summary

v0.5.0 starts the paid MVP packaging work. The app now shows Free usage limits and explains the 9,900 KRW Pro pilot package more clearly.

## Product Changes

- Added Free usage counters for:
  - AI generation: 30/month
  - Saved marketing drafts: 20/month
  - Schedule plans: 10/month
- Added live usage progress to the sidebar Pro card.
- Added usage cards to the Settings account section.
- Added Free quota checks to AI generation, hashtag generation, AI chat, draft saving, and schedule-plan creation.
- Added a Free limit modal that explains why Pro exists.
- Reworked the Pro modal into a Free vs Pro comparison and pilot package explanation.

## Versioning Decision

- v0.4.8 is treated as a release-readiness documentation update.
- v0.5.x is reserved for customer-facing paid MVP packaging, pricing, onboarding, and pilot-readiness changes.

## Verification

- Local static server loaded `index.html` successfully.
- Browser check confirmed:
  - Sidebar usage widget renders 3 usage rows.
  - Settings usage panel renders 3 usage cards.
  - AI tab navigation still works.
  - No browser console errors were reported.
- `node --check` could not run because the bundled `node.exe` returned `Access is denied` in this desktop shell.

## Known Limits

- This is not a real billing implementation.
- Pro activation is still a pilot-intent UI, not checkout.
- Usage counters are stored in localStorage and should move to a database when auth is introduced.
- Deleting scheduled posts does not refund usage quota; this is acceptable for pilot packaging but should be revisited before real billing.
