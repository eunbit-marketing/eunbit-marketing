# Bloom

Bloom is a Korean small-business marketing assistant for owners who want to start marketing without agency calls, high retainers, or complicated tooling.

The current product began as an Instagram marketing dashboard for the pilot store `eunbit calligraphy`, and is now being repositioned as a monthly 9,900 KRW AI marketing assistant for Instagram and Naver Place.

## Current Status

- Production baseline: v0.6.8 studio auto-type preview candidate
- Latest feature commit: `f57db9b` (`Show studio Naver auto type`)
- Preview baseline: aligned with `main` on branch `codex/bloom-business-roadmap`
- Preview URL: https://eunbit-marketing-git-codex-bl-8111c1-eunbit-marketings-projects.vercel.app
- PR status: PR #1 is still Draft, but the v0.4 code-review stabilization items are complete and ready for final release review
- Figma baseline: v0.6.2 notes should track one-click studio plus banner preview cards
- Source of truth for implementation: local code, GitHub branch, and Vercel preview

## Deployment Audit

| Version | Commit | Production check | Notes |
| --- | --- | --- | --- |
| v0.6.0 | `5ef65d7` | Confirmed on live site, 2026-06-02 KST | Four-tab pilot IA is present in the production HTML. |
| v0.6.1 | `d68d2cc` | Confirmed on live site, 2026-06-02 KST | One-click studio hooks are present in the production JS/HTML. |
| v0.6.2 | `620ca32` | Confirmed on live site, 2026-06-02 KST | Banner preview card rendering is present in the production JS. |
| v0.6.3 | `36c84ab` | Confirmed on live site, 2026-06-02 KST | Production HTML/JS include `ai-naver-period`, `naver-detail-grid`, and `getNaverPlaceDetails`. |
| v0.6.4 | `192d2c9` | Confirmed on live site, 2026-06-02 KST | Production JS/CSS include `copyCurrentMarketingKitBannerPart`, `copyMarketingKitBannerPart`, and `banner-preview-actions`. |
| v0.6.5 | `ba2908d` | Confirmed on live site, 2026-06-02 KST | Production HTML/JS include `studio-detail-grid`, `studio-period`, `getStudioDetails`, and `getMarketingKitDetails`. |
| v0.6.6 | `7a5e2bc` | Confirmed on live site, 2026-06-03 KST | Production HTML/CSS include `선택 입력이에요`, `전용 도구예요`, and `studio-detail-note`. |
| v0.6.7 | `4db2613` | Confirmed on live site, 2026-06-03 KST | Production HTML/CSS include `네이버 소식 유형은 Bloom이 자동으로 맞춥니다`, `아래 네이버 전용 도구`, and `studio-path-note`. |
| v0.6.8 | `f57db9b` | Pending production check | One-click Studio shows Bloom's inferred Naver content type while the owner types. |

## Product Direction

Bloom should help one-person shops and local small businesses answer a simple question:

> What should I do for marketing today?

Initial MVP focus:

- Instagram caption and hashtag generation
- Naver Place news, coupon, and review-reply draft generation
- Weekly marketing plan generation
- Calendar-style planning and copy-ready content
- Clear demo/real-data labeling until live integrations are added

Live auto-publishing, account integrations, billing, and multi-tenant data storage belong to the SaaS phase after the copy-ready MVP proves demand.

## Tech

- Frontend: static HTML app with separated CSS/JS assets
- UI shell: `index.html`
- Styles: `assets/css/styles.css`
- Client behavior: `assets/js/app.js`
- APIs: Vercel Serverless functions in `api/`
- AI chat proxy: `api/chat.js`
- AI prompt backdata: `api/_prompt-data.js`
- One-click marketing kit: `api/marketing-kit.js`
- Naver Place writer: `api/naver-place.js`
- Naver Place API output: copy-ready `text` plus structured `package` data for title/body/CTA/checklist UI.
- AI provider: Anthropic API through `ANTHROPIC_API_KEY`
- Optional model override: `ANTHROPIC_MODEL`
- If a configured Anthropic model is unavailable in the current workspace, the API retries compatible fallback models so pilot users do not hit a dead end.
- Data today: browser `localStorage`
- Deployment target: Vercel

## Local Preview

```bash
npx serve .
```

or open `index.html` directly for static UI checks. API-backed features need a Vercel-compatible local server and `ANTHROPIC_API_KEY`.

## Roadmap

- v0.1: Reposition Bloom from an Eunbit-specific dashboard into a general small-business assistant
- v0.2: Build copy-ready Instagram and Naver Place tools
- v0.3: Add guided onboarding and "today's marketing plan"
- v0.4: Improve calendar planning, draft saving, and pilot-store workflows (ready candidate: weekly draft queue, today's tasks, draft filters, category sync, chat proxy, shared fallback constants, and data-setting based settings forms added)
- v0.5: Prepare paid MVP packaging around 9,900 KRW/month (started: Free usage counters, Pro comparison, pilot pricing modal, 3-minute onboarding result flow, pilot proposal page, AI-backed Naver Place writing, one-click Instagram+Naver kit, clearer pilot copy-ready language, saved kit bundles, pilot feedback capture, and banner text templates)
- v0.6: Simplify the pilot-facing product surface into four core destinations: Home, One-click creation, Vault, and My Store. Keep specialist tools available as support paths while reducing first-time-user confusion.
- v0.6.1: Promote One-click creation into a large studio surface and expand kits beyond Instagram/Naver into coupons, review replies, banner copy, BGM/mood, posting time, and storage tabs.
- v0.6.2: Turn saved banner copy into visual preview cards so pilot users can understand how the first image/card-news slide could look before copying text.
- v0.6.3: Add Naver Place detail inputs for period, benefit, contact method, and tone so local-store drafts become more concrete before pilot outreach.
- v0.6.4: Clarify banner copy behavior with separate full, headline, and CTA copy buttons in generated kits and saved kit cards.
- v0.6.5: Extend period, benefit, and contact detail inputs into the One-click Studio so the main creation flow produces more concrete Naver/coupon kit output.
- v0.6.6: Add guidance that One-click Studio details are optional and position the Naver Place writer as the advanced refinement path after one-click generation.
- v0.6.7: Clarify One-click Studio field scope: mood buttons handle tone, Bloom auto-selects Naver content type, and the Naver writer remains the advanced refinement path.
- v0.6.8: Show Bloom's inferred Naver content type in One-click Studio so owners can see what the automatic path is doing before generation.
- v1.0: Launch with 3-5 pilot stores before deep platform integrations
