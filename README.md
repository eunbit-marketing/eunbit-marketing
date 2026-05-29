# Bloom

Bloom is a Korean small-business marketing assistant for owners who want to start marketing without agency calls, high retainers, or complicated tooling.

The current product began as an Instagram marketing dashboard for the pilot store `eunbit calligraphy`, and is now being repositioned as a monthly 9,900 KRW AI marketing assistant for Instagram and Naver Place.

## Current Status

- Live baseline: v2.2 on Vercel from GitHub commit `a175c3d`
- Local baseline: v2.3 work-in-progress preserved in this repository
- Figma baseline: v2.0 design file, behind the current code
- Source of truth for implementation: local code and deployed app

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

- Frontend: single-file HTML/CSS/JS app
- APIs: Vercel Serverless functions in `api/`
- AI provider: Anthropic API through `ANTHROPIC_API_KEY`
- Data today: browser `localStorage`
- Deployment target: Vercel

## Local Preview

```bash
npx serve .
```

or open `index.html` directly for static UI checks. API-backed features need a Vercel-compatible local server and `ANTHROPIC_API_KEY`.

## Roadmap

- v2.3: stabilize local UI improvements, dark mode, accessibility, keyboard shortcuts, demo-data clarity
- v2.4: reposition onboarding and copy around Instagram + Naver Place marketing assistant
- v2.5: add Naver Place content tools and weekly marketing plan MVP
- v3.0: authentication, database, real Instagram integration, billing, multi-store SaaS structure

