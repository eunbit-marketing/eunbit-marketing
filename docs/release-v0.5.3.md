# Bloom v0.5.3 Release Notes

Date: 2026-06-01

## Summary

v0.5.3 turns the Naver Place assistant from a browser-only template into a real AI-backed writing tool and strengthens Bloom's prompt backdata for future "딸깍 마케팅 키트" work.

## Direction Review

새봄's latest direction is correct: Bloom should move from "AI 글 생성기" to "딸깍 마케팅 키트."

The practical v0.5.3 interpretation is:

- Keep the current app stable.
- Strengthen the AI writing foundation first.
- Make Naver Place a real first-class channel.
- Prepare prompt data that can later power captions, banners, BGM recommendations, profiles, and one-click packages.

## What Changed

- Added shared prompt backdata in `api/_prompt-data.js`.
- Rebuilt `api/caption.js` so Instagram captions use:
  - store name
  - category
  - region
  - main offer
  - target customer
  - tone
  - category-specific customer pains, trust signals, recommended words, and avoid rules
- Added `api/naver-place.js`.
- Naver Place AI now supports:
  - Place news
  - coupon copy
  - review replies
  - weekly marketing plans
  - store profile introductions
- Updated the frontend Naver Place tool to call `/api/naver-place`.
- Preserved offline fallback templates when the API key or local server is unavailable.
- Updated hashtag generation to use `ANTHROPIC_MODEL` or the stable default model.
- Added shared Anthropic model fallback handling for caption, hashtag, chat, and Naver Place endpoints.

## AI Connection

The project already uses Anthropic through `ANTHROPIC_API_KEY`.

v0.5.3 makes this more usable by standardizing the default model to `claude-sonnet-4-6` while still allowing deployment override through `ANTHROPIC_MODEL`. If the deployment workspace cannot access that model, the server retries compatible fallback models before returning an error.

## Next Recommended Update

v0.6.0 should begin the "딸깍" UX transition:

- Add a simplified 4-tab structure prototype.
- Create a first-pass "딸깍 만들기" flow.
- Reuse the new prompt backdata to generate an Instagram caption and Naver Place copy together.
- Add banner and BGM outputs after the writing pipeline is stable.
