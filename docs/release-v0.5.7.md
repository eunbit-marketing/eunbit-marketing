# Bloom v0.5.7 Release Notes

v0.5.7 makes the one-click marketing kit feel like a real workflow instead of a one-time output. Saved kits now remain visible as a bundle inside the weekly draft area, so a pilot user can return to the Instagram and Naver drafts together.

## Implemented

- Added `state.marketingKits` for saved one-click kit bundles.
- Added a "마케팅 키트 보관함" section above the weekly draft list.
- The kit vault shows:
  - kit title,
  - Instagram preview,
  - Naver Place preview,
  - visual/photo direction,
  - first checklist items,
  - bundle actions.
- "둘 다 저장" now saves both individual drafts and a grouped kit bundle.
- Added bundle actions:
  - copy the full kit,
  - send the Instagram draft into the schedule plan,
  - copy the Naver Place draft,
  - delete the bundle.
- Today's task cards now count saved kit bundles and prioritize them as the next action.
- Draft IDs now include a small random offset to avoid collisions when multiple drafts are saved in the same millisecond.

## Why It Matters

This is a major step toward Saebom's "딸깍 패키지" direction. A small-business owner should not need to remember which Instagram draft belongs to which Naver notice. The package should stay together until the owner copies, schedules, or marks the work complete.

## Verification

- `git diff --check` passed.
- Local static server responded with `200`.
- Production deployment should be checked after push by confirming the live HTML contains `marketing-kit-vault`.

