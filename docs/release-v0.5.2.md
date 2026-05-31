# Bloom v0.5.2 Release Notes

Date: 2026-06-01

## Summary

v0.5.2 adds a customer-facing pilot proposal page to the live app. This turns 새봄's Notion proposal into a screen that can be shown or sent to a real small-business owner before the full SaaS foundation is ready.

## What Changed

- Added the `파일럿 제안서` tab.
- Added a homepage button that opens the proposal page.
- Added pilot messaging:
  - "업체 문의 없이, 비싼 대행 없이, 오늘 할 마케팅을 AI가 대신 정리합니다."
  - Instagram, Naver Place, weekly planning, draft queue, today's tasks, and AI chat as the six visible features.
  - Free vs Pro packaging around the 9,900 KRW/month offer.
  - Pilot benefits including Pro 6 months free, 1:1 onboarding, and feedback-first roadmap.
- Added a four-step copy-ready flow:
  - Store info.
  - One-line update.
  - AI draft generation.
  - Copy and post manually.
- Added proposal search coverage, `G F` shortcut navigation, and live-link copying to `https://eunbit-marketing.vercel.app/#proposal`.
- Direct proposal links now skip the automatic onboarding modal so pilot customers can read the offer first.

## Product Decision

The next customer-facing step is not more explanation in Notion. It is a link-ready product page that can support pilot outreach. This page lets Bloom be introduced as a business offer while the app remains honest about being copy-ready rather than auto-publishing.

## Verification Focus

- Proposal tab opens from sidebar and homepage.
- Direct `#proposal` link opens the proposal page without the onboarding modal.
- Mobile layout stacks pricing, features, and flow without overflow.
- `라이브 링크 복사` shows feedback.
- Existing onboarding and AI tool navigation remain intact.
