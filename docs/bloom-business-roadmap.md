# Bloom Business Roadmap

Date: 2026-05-30

## Snapshot

Bloom is a polished single-page prototype for a Korean small-business AI marketing assistant. It began as the Eunbit pilot dashboard, but Eunbit is now treated as the first customer example rather than the product identity.

The current app supports dashboard navigation, content drafting, reservation planning, analytics mockups, AI assistant tools, onboarding, dark mode, accessibility improvements, and browser localStorage persistence.

Current release state:

- Production: v0.5.0 from `main` commit `26a5584`
- Preview: aligned with `main` from `codex/bloom-business-roadmap` commit `26a5584`
- Preview URL: https://eunbit-marketing-git-codex-bl-8111c1-eunbit-marketings-projects.vercel.app
- PR #1: Draft, now a Ready candidate after v0.4.5-v0.4.7 stabilization

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
- Draft queue filters now support all, Instagram, Naver Place, weekly plan, draft, scheduled, and posted views.
- Category sync, server-side AI chat proxy, shared fallback constants, search constants, and data-setting based settings persistence are complete.
- Status: Ready candidate for PR review and main deployment.

### v0.5 Paid MVP Packaging

Goal: Validate whether owners will pay 9,900 KRW/month for the assistant.

- Free vs Pro limits and usage counters. Started in v0.5.0 with monthly AI generation, saved draft, and schedule-plan counters.
- 9,900 KRW/month pricing explanation. Started in v0.5.0 through the Pro comparison modal.
- Pro upgrade screen that no longer feels like a placeholder. Started in v0.5.0 as a pilot package explanation rather than a fake checkout.
- Demo and real-data labels.
- Pilot feedback loop.
- Manual billing or lightweight payment test before full billing integration.

### v0.5.0 Free/Pro Packaging Start

Implemented:

- Added `state.plan` and monthly `state.usage` counters.
- Free limits are now explicit: AI generation 30/month, saved drafts 20/month, schedule plans 10/month.
- Sidebar Pro card now shows live usage progress.
- Settings account section now shows three usage cards.
- AI generation, hashtag generation, chat, saved draft, and schedule-plan actions now consume Free quota.
- When a Free limit is reached, Bloom opens a Pro explanation modal instead of silently continuing.
- Pro modal now explains the 9,900 KRW pilot package and Free/Pro difference without pretending checkout is live.

Decision:

- v0.4.8 remains a documentation/release-readiness update.
- v0.5.x is reserved for customer-facing packaging, pricing, onboarding, and pilot-readiness changes.

### v0.5.1 Three-Minute Onboarding Result Flow

Implemented:

- Onboarding now generates three concrete outputs immediately after store setup:
  - Instagram starter copy.
  - Naver Place notice copy.
  - First-week marketing plan.
- The result modal lets the owner review the three drafts before leaving onboarding.
- The owner can save all three drafts to the weekly draft queue in one action.
- Saved onboarding drafts are counted against Free saved-draft usage so the pricing model is visible during pilot testing.
- The Settings account section now includes a button to rerun the 3-minute onboarding flow.

Decision:

- Onboarding should not only collect data. It must create the first visible win before the owner explores the dashboard.

### v0.5.2 Pilot Proposal Page

Implemented:

- Added a customer-facing pilot proposal tab inside the app.
- Turned 새봄's one-page proposal copy into a live product screen covering:
  - Bloom's core promise for small-business owners.
  - Six pilot-visible features.
  - Free and Pro packaging.
  - Pilot benefits and the copy-ready four-step flow.
- Added a homepage entry button so mobile users can reach the proposal without opening the desktop sidebar.
- Added proposal search coverage, `G F` keyboard navigation, and a live-link copy action.

Decision:

- Before adding more product depth, Bloom needs a clear page that explains the pilot offer to real store owners. v0.5.2 makes the production link easier to send and discuss in 1:1 pilot outreach.

### v0.5.3 AI Prompt Foundation and Naver Place API

Implemented:

- Added shared prompt backdata for category-specific customer pains, trust signals, recommended words, and avoid rules.
- Rebuilt the Instagram caption API so generation uses store context instead of tone alone.
- Added a real `/api/naver-place` endpoint for Naver Place writing.
- Connected the frontend Naver Place tool to the new API while preserving offline fallback templates.
- Added Naver Place profile introduction generation as a new output type.
- Standardized AI model selection through `ANTHROPIC_MODEL` with `claude-sonnet-4-20250514` as the default.
- Added model fallback handling so unavailable Anthropic model access does not block pilot users.

Decision:

- Before the full v0.6 "딸깍" UI rewrite, Bloom needs stronger AI writing foundations. Naver Place should be treated as a first-class channel, not a fallback template inside the browser.

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
