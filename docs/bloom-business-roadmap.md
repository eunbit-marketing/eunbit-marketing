# Bloom Business Roadmap

Date: 2026-05-30

## Snapshot

Bloom is a polished single-page prototype for a Korean small-business AI marketing assistant. It began as the Eunbit pilot dashboard, but Eunbit is now treated as the first customer example rather than the product identity.

The current app supports dashboard navigation, content drafting, reservation planning, analytics mockups, AI assistant tools, onboarding, dark mode, accessibility improvements, and browser localStorage persistence.

## Product Thesis

Small business owners do not first need a complex social media platform. They need a low-friction assistant that answers one question:

> What should I do for marketing today?

The first paid offer should be:

> 월 9,900원으로 오늘 할 마케팅을 AI가 정리해주는 소상공인 마케팅 비서.

## Video-Inspired Reframe

The reference clips showed a strong flow: enter business information, upload a photo, let AI draft the post, preview it on a phone, schedule it, and watch the dashboard update.

Bloom should keep that flow, but sharpen it for Korean small businesses:

- Start from "what should I do for marketing today?"
- Support Instagram and Naver Place from the first paid MVP.
- Make the first version copy-ready rather than integration-heavy.
- Treat scheduling as a planning workflow until real publishing APIs are stable.

## Progress Assessment

- UI prototype: high maturity
- AI content MVP: medium maturity
- Planning workflow: improving with v0.4
- Real SaaS foundation: early
- Business positioning: promising, now shifting from Instagram-only to small-business marketing assistant

## MVP Direction

Focus on copy-ready, low-risk workflows before live publishing:

- Instagram post captions and hashtags
- Naver Place news post drafts
- Naver Place coupon copy
- Review reply drafts
- Weekly marketing calendar
- Draft queue with simple statuses: draft, copied, scheduled, posted manually
- Category-specific prompts for restaurants, cafes, craft shops, beauty, education, local services, and health

## Version Roadmap

### v0.1 Product Repositioning

Goal: Move from "Eunbit marketing dashboard" to "Bloom, the small-business AI marketing assistant."

- Make Eunbit the first pilot customer only.
- Replace product-level copy with general small-business language.
- Keep Eunbit as sample data where useful.
- Clarify the core promise: "월 9,900원으로 오늘 할 마케팅을 AI가 정리합니다."

### v0.2 Copy-Ready Multi-Channel MVP

Goal: Give owners immediately usable marketing drafts before building hard integrations.

- Instagram caption and hashtag tools.
- Naver Place news, coupon, and review-reply tools.
- Weekly marketing plan generator.
- Copy buttons and "save as idea" flows.
- Clear labels for demo data vs real data.

### v0.3 Guided Onboarding

Goal: Turn a new owner into a usable workspace in under three minutes.

- Store name, category, region, offer, tone, and target customer inputs.
- Recommended first-week plan after onboarding.
- First Instagram draft and first Naver Place draft generated automatically.
- Pilot-friendly setup for non-technical users.
- Status: first-pass onboarding modal implemented in the app and PR branch.

### v0.4 Planning Workspace

Goal: Make Bloom a weekly habit, not a one-off generator.

- "This week's draft queue" added to the reservation screen.
- AI-generated Instagram, Naver Place, and weekly-plan outputs can be saved into the queue.
- Drafts can be copied, moved into the reservation editor, marked as posted, or deleted.
- Simple status labels now exist: draft, copied, scheduled, posted.
- Dashboard "today's marketing tasks" now reads draft and schedule status to suggest the next action.
- Next: add filters and stronger pilot-store feedback collection.

### v0.5 Paid MVP Packaging

Goal: Validate whether owners will pay 9,900 KRW/month for the assistant.

- Free vs Pro limits.
- Pricing explanation.
- Demo and real-data labels.
- Pilot feedback loop.
- Manual billing or lightweight payment test before full billing integration.

### v1.0 Pilot Launch

Goal: Launch to 3-5 real stores and learn from actual usage.

- Pilot stores across at least three categories.
- Weekly feedback review.
- Track draft generation, copy usage, weekly active use, and willingness to pay.
- Decide whether to invest next in real Instagram/Naver integrations, database, auth, and billing.

## Tooling Notes

- GitHub remains the source for version control and PR review.
- Notion is the business and progress record.
- Figma can now be used again for design synchronization after the plan upgrade.
- Code and live behavior remain the implementation source of truth, with Figma used to document and align product flows.
