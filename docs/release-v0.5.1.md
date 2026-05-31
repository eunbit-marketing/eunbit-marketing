# Bloom v0.5.1 Release Notes

Date: 2026-06-01

## Summary

v0.5.1 improves the first-run experience. After the owner enters basic store information, Bloom now shows ready-to-use Instagram, Naver Place, and weekly plan drafts before sending them into the app.

## Product Changes

- Added an onboarding result modal with three starter outputs:
  - Instagram copy.
  - Naver Place notice copy.
  - First-week marketing plan.
- Added a one-click action to save all three starter drafts to the weekly draft queue.
- Preloads the starter outputs into the AI assistant result panels.
- Added a Settings button to rerun the 3-minute onboarding flow.
- Saving onboarding starter drafts consumes Free saved-draft usage so pilot users can see the Free/Pro model in context.

## Verification

- Local static server loaded `index.html`.
- Browser check confirmed:
  - Settings can rerun onboarding.
  - Completing onboarding shows the starter result modal.
  - The result modal contains Instagram, Naver Place, and weekly plan cards.
  - Saving starter drafts moves the owner to the draft queue.
  - No browser console errors were reported.

## Known Limits

- Starter drafts are template-based, not server-generated AI responses.
- Onboarding does not yet collect explicit feedback after the first draft save.
- The starter draft save action can partially save if the Free saved-draft limit is nearly exhausted.
