# Bloom v0.5.4 Release Notes

## Summary

v0.5.4 turns the Naver Place result from a plain text answer into a copy-ready execution package. This follows Saebom's feedback that Bloom should feel less like a generic AI writer and more like a "one-click marketing kit" for small-business owners.

## What Changed

- `/api/naver-place` now asks the model for structured JSON:
  - short title
  - body copy
  - call-to-action
  - pre-publish checklist
  - full copy-ready text
- The API still returns `text` for compatibility, but also returns `package` for richer UI rendering.
- The frontend Naver Place tool now renders a package card instead of one unstructured text block.
- Copy and draft-save actions continue to use the full copy-ready text.
- Offline fallback output is normalized into the same package shape.

## Product Judgment

This update is intentionally small but important. For pilot users, the problem is not only "write me a sentence." They need to know what to post, what to check before posting, and what to copy. The package card makes the next action clearer without pretending Bloom can publish automatically yet.

## Verification

- `git diff --check` passed.
- The Naver Place API module imports successfully in the local Node REPL.
- Browser automation with Playwright could not run because Playwright is not installed in this local environment.
- Live API verification should be repeated after deployment to confirm structured `package` output on Vercel.

## Next Recommended Update

Use the same package shape for a combined "Instagram + Naver Place" kit:

1. Instagram caption.
2. Naver Place notice.
3. Suggested image/banner direction.
4. Copy checklist.
5. One-click save to draft queue.
