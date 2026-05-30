# Bloom Modularization Plan

## Current v0.4.4 Split

Bloom now keeps the static deployment model but separates the largest file into three implementation surfaces:

- `index.html`: page shell and static markup
- `assets/css/styles.css`: design tokens, layout, responsive styles, and component styles
- `assets/js/app.js`: local state, event handlers, AI tool flows, calendar logic, settings, and hashtag tools
- `api/chat.js`: serverless chat proxy so the browser never calls Anthropic directly
- Shared constants in `assets/js/app.js`: `HASHTAG_FALLBACK`, `SEARCH_TABS`, and `SEARCH_FEATURES` now live once near the top of the app instead of being recreated inside feature functions

This keeps Vercel deployment simple while making future changes easier to review.

## Next Split Candidates

Before v0.5, split by product area rather than by tiny helper function.

- `constants`: hashtag fallbacks, search targets, theme data, category options
- `state`: storage key, default state, load/save helpers, normalization helpers
- `navigation`: tab switching, search, keyboard shortcuts, modal helpers
- `marketing-drafts`: weekly draft queue, filters, status actions
- `ai-tools`: caption, hashtag, idea, Naver Place, optimal time, AI chat
- `schedule`: calendar, scheduled posts, time picker
- `settings`: profile, theme, dark mode, account actions
- `hashtag`: hashtag page generator, trending chart, history

## Figma Component Map

Ask Saebom to mirror these groups in Figma:

- App shell: sidebar, top actions, bottom tabs, modal
- Dashboard: stat cards, today's tasks, story ring, AI recommendation card
- Content creation: upload zone, tone chips, category chips, AI panel
- Schedule: calendar, time picker, mobile preview, draft queue, filter chips
- AI assistant: mode tabs, tool card, result actions, chat messages
- Settings: settings nav, form rows, theme swatches, plan card

## Guiding Rule

Do not introduce a build system just to split files. Move to Vite or Next.js only when authentication, database-backed sessions, or paid SaaS routing make the static file model too limiting.
