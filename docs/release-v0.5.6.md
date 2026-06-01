# Bloom v0.5.6 Release Notes

v0.5.6 is a pilot-clarity update. It follows Saebom's repeated feedback that Bloom must be honest with first users: the product is copy-ready and planning-ready, but it does not automatically publish to Instagram or Naver yet.

## Implemented

- Added a homepage pilot banner explaining that Bloom is currently a browser-stored pilot test version.
- Added a post editor notice clarifying that the user should copy and upload through their own Instagram account.
- Changed the post editor primary action from "지금 발행하기" to "복사하고 저장".
- Updated the action behavior so it copies the caption and saves it to the weekly draft queue instead of implying a live publish.
- Renamed the scheduling surface from "예약 발행" to "예약 계획" in visible labels and key guidance.
- Added a schedule notice explaining that saved items are posting plans, not automatic uploads.
- Updated related toasts and helper copy to avoid misleading "auto publish" language.

## Why It Matters

This update reduces the biggest trust risk before pilot outreach. A small-business owner should immediately understand what Bloom can do today:

- create marketing copy,
- organize a posting plan,
- save and copy drafts,
- help them publish manually.

It also keeps the door open for real auto-publishing later, once account integrations, data storage, and platform permissions are ready.

## Verification

- Static text scan confirms the old "지금 발행하기" and live-publish success toast are removed.
- Monthly usage reset logic was already present through `state.usage.period` and `ensureUsagePeriod()`.
- Remaining auto-publish work is explicitly positioned as a later integration phase.

