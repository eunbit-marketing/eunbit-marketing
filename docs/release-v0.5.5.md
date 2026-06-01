# Bloom v0.5.5 Release Notes

## Summary

v0.5.5 adds the first real "딸깍 마케팅 키트" workflow. A single owner input now generates an Instagram caption, hashtag set, Naver Place notice, visual direction, and pre-publish checklist together.

## What Changed

- Added `api/marketing-kit.js`.
- Added a wide "딸깍 마케팅 키트" card at the top of the AI tools screen.
- The kit generates:
  - Instagram caption
  - Instagram hashtags
  - Naver Place notice copy
  - photo/banner direction
  - pre-publish checklist
- Added actions to:
  - copy the whole kit
  - save Instagram and Naver drafts together
  - send the Instagram draft to the post editor
- Added offline fallback output in the same kit shape.

## Product Judgment

This is the first visible step from "AI writing tools" toward "one-click marketing kit." It keeps the product honest: Bloom still does not auto-publish, but it now gives the owner a complete pair of copy-ready channel drafts from one prompt.

## Verification

- `git diff --check` should pass before release.
- API module import should be checked locally.
- Live `/api/marketing-kit` should be tested after Vercel production deployment.

## Next Recommended Update

Add one-click kit-to-draft queue detail view:

1. Show the saved Instagram and Naver drafts as a grouped pair.
2. Add a "오늘 할 일" task that points to the kit.
3. Track kit generation separately from single-tool generation for pilot learning.
