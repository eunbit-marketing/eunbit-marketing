# Bloom

Bloom is a Korean small-business marketing assistant for owners who want to start marketing without agency calls, high retainers, or complicated tooling.

The current product began as an Instagram marketing dashboard for the pilot store `eunbit calligraphy`, and is now being repositioned as a monthly 9,900 KRW AI marketing assistant for Instagram and Naver Place.

## Current Status

- Production baseline: v0.5.2 release candidate, ready for Vercel production deployment
- Preview baseline: aligned with `main` on branch `codex/bloom-business-roadmap`
- Preview URL: https://eunbit-marketing-git-codex-bl-8111c1-eunbit-marketings-projects.vercel.app
- PR status: PR #1 is still Draft, but the v0.4 code-review stabilization items are complete and ready for final release review
- Figma baseline: v0.4.7 update notes exist, but production UI capture/prototype work should start in v0.5
- Source of truth for implementation: local code, GitHub branch, and Vercel preview

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
- AI provider: Anthropic API through `ANTHROPIC_API_KEY`
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
- v0.5: Prepare paid MVP packaging around 9,900 KRW/month (started: Free usage counters, Pro comparison, pilot pricing modal, 3-minute onboarding result flow, and pilot proposal page)
- v1.0: Launch with 3-5 pilot stores before deep platform integrations
