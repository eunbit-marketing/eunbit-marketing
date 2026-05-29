# Bloom Business Roadmap

Date: 2026-05-29

## Snapshot

Bloom is currently a polished single-page prototype with working dashboard navigation, content drafting, reservation management, analytics mockups, AI assistant tools, dark mode groundwork, and localStorage persistence.

The GitHub production baseline came from the Eunbit pilot dashboard. From this point forward, Eunbit is treated as the first pilot customer, not the main identity of the product.

## Video-Inspired Reframe

The reference clips show a simple but strong user journey: enter business information, upload a photo, let AI draft the post, preview the result on a phone mockup, schedule it, and watch the dashboard update.

Bloom should keep that flow, but sharpen it for Korean small businesses:

- Start from "what should I do for marketing today?"
- Support Instagram and Naver Place from the first paid MVP.
- Make the first version copy-ready rather than integration-heavy.
- Treat scheduling as a planning workflow until real publishing APIs are stable.

## Progress Assessment

- UI prototype: high maturity
- AI content MVP: medium maturity
- Real SaaS foundation: early
- Business positioning: promising, but should shift from Instagram-only to small-business marketing assistant

## Product Thesis

Small business owners do not first need a complex social media platform. They need a low-friction assistant that tells them what to post, writes drafts, and helps them keep a simple weekly rhythm.

The strongest first offer is:

> 월 9,900원으로 오늘 할 마케팅을 AI가 정리해주는 소상공인 마케팅 비서.

## MVP Direction

Focus on copy-ready, low-risk workflows before live publishing:

- Instagram post captions and hashtags
- Naver Place news post drafts
- Naver Place coupon copy
- Review reply drafts
- Weekly marketing calendar
- Category-specific prompts for restaurants, cafes, craft shops, beauty, and local services

## Next Four Steps

1. Project cleanup and v2.3 deployment
2. Multi-channel MVP with Instagram and Naver Place tools
3. Pilot recruitment with 3-5 stores
4. SaaS foundation with auth, database, billing, and real platform integrations

## Version Roadmap

### v0.1 — Product Repositioning

Goal: Move from "Eunbit marketing dashboard" to "Bloom, the small-business AI marketing assistant."

- Make Eunbit the first pilot customer only.
- Replace product-level copy with general small-business language.
- Keep Eunbit as default sample data where useful.
- Clarify the core promise: "월 9,900원으로 오늘 할 마케팅을 AI가 정리합니다."

### v0.2 — Copy-Ready Multi-Channel MVP

Goal: Give owners immediately usable marketing drafts before building hard integrations.

- Instagram caption and hashtag tools.
- Naver Place news, coupon, and review-reply tools.
- Weekly marketing plan generator.
- Copy buttons and "save as idea" flows.
- Clear labels for demo data vs real data.

### v0.3 — Guided Onboarding

Goal: Turn a new owner into a usable workspace in under three minutes.

- Store name, category, region, offer, tone, and target customer inputs.
- Recommended first-week plan after onboarding.
- First Instagram draft and first Naver Place draft generated automatically.
- Pilot-friendly setup for non-technical users.

### v0.4 — Planning Workspace

Goal: Make Bloom a weekly habit, not a one-off generator.

- "Today's marketing tasks" dashboard.
- Calendar draft queue across Instagram and Naver Place.
- Draft history and reusable templates.
- Simple status labels: draft, copied, scheduled, posted manually.

### v0.5 — Paid MVP Packaging

Goal: Validate whether owners will pay 9,900 KRW/month for the assistant.

- Free vs Pro limits.
- Landing copy and pricing explanation.
- Pilot feedback loop.
- Manual billing or lightweight payment test before full billing integration.

### v1.0 — Pilot Launch

Goal: Launch to 3-5 real stores and learn from actual usage.

- Pilot stores across at least three categories.
- Weekly feedback review.
- Track draft generation, copy usage, weekly active use, and willingness to pay.
- Decide whether to invest next in real Instagram/Naver integrations, database, and auth.

## Notes

Figma remains useful for brand and layout reference, but the current implementation is ahead of the Figma file. Until Figma MCP limits are resolved, code and live behavior should remain the implementation source of truth.
