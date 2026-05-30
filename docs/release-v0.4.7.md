# Bloom v0.4.7 Release Candidate

Date: 2026-05-30

## Status

v0.4.7 is the current release candidate for the `codex/bloom-business-roadmap` branch.

- Production baseline: v2.2, `main` commit `a175c3d`
- Preview baseline: v0.4.7, branch commit `1a9885a`
- Preview URL: https://eunbit-marketing-git-codex-bl-8111c1-eunbit-marketings-projects.vercel.app
- PR: #1, still Draft

## Why This Is Ready For Review

Saebom's four stabilization items are complete:

- AI chat now uses `api/chat.js` instead of calling Anthropic from the browser.
- Hashtag fallback data is centralized in `HASHTAG_FALLBACK`.
- Search tab and feature data are centralized in `SEARCH_TABS` and `SEARCH_FEATURES`.
- Settings save/restore uses `data-setting` fields instead of label text matching.

## Included Product Changes

- Naver Place assistant MVP for news, coupons, review replies, and weekly plans.
- Guided onboarding for store information, category, tone, offer, and target customer.
- Weekly draft queue with copy, schedule, posted, and delete actions.
- Today's marketing tasks on the dashboard.
- Draft filters for channel and status.
- Category sync across onboarding, settings, post creation, AI tools, and hashtag tools.
- Modularized static app structure:
  - `index.html`
  - `assets/css/styles.css`
  - `assets/js/app.js`
  - `api/chat.js`

## Verification Performed

- Local static app loads after the HTML/CSS/JS split.
- Settings values save and restore through localStorage after page reload.
- Category changes persist and sync to related UI controls.
- AI chat fallback path works when `/api/chat` is unavailable in a static local server.
- Vercel preview deployment for commit `1a9885a` is `READY`.

## Known Limits Before Main Deployment

- Production is still v2.2 until PR #1 is merged.
- Preview deployments may require Vercel authentication depending on project protection settings.
- Analytics data is still demo data.
- Publishing is still a planning/copy workflow, not real automatic Instagram or Naver publishing.
- Payment is not connected.

## Release Decision

Recommended next step:

1. Review PR #1 preview as the pilot-ready v0.4.7 candidate.
2. Convert PR #1 from Draft to Ready.
3. Merge to `main` if preview checks pass.
4. Confirm production Vercel deployment.
5. Start v0.5 with Free/Pro limits, 9,900 KRW pricing, and pilot packaging.
