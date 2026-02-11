# Plan: Issue #44 FAQ / Intro Page

Date: 2026-02-11
Owner: @qcwssss
Status: planned

## Context

Issue #44 currently has one remaining unchecked item:
- Add an intro/FAQ page that explains how to use the product and what features it includes.

Completed items (already done on separate PRs/branches):
- Share page promo section + conversion CTA
- Share page top-right create-notes CTA
- Share page contextual help hint (`?` popover)

## Goal

Create a public FAQ page to help first-time users quickly understand:
- what the product does,
- how to start,
- what key features are available,
- what limitations apply (e.g., read-only shared notes).

## Scope (MVP)

1) Add a new public route:
- `/faq`

2) Add FAQ content sections:
- Quick product intro
- "How to use" (3-step flow)
- FAQ list (6-8 practical questions)

3) Add entry links:
- Link from `/home`
- Link from `src/app/share/[token]/page.tsx`

4) Add i18n copy:
- English and Chinese strings under a new `faq` key in `src/i18n/messages.ts`

## Out of Scope (for this pass)

- Search inside FAQ
- FAQ categories/tabs
- Analytics tracking for FAQ clicks
- Advanced docs system or markdown-driven content

## File-by-File Plan

1. `src/app/faq/page.tsx`
- New page with:
  - title + subtitle
  - brief "How it works" section
  - FAQ section
  - bottom CTA buttons (`/home`, app entry)

2. `src/i18n/messages.ts`
- Add `faq` namespace for EN/ZH strings:
  - page title/subtitle
  - step labels
  - question/answer pairs
  - CTA labels

3. `src/app/home/page.tsx`
- Add a visible text link/button to `/faq`

4. `src/app/share/[token]/page.tsx`
- Add a visible text link/button to `/faq` near existing conversion/help controls

5. (Optional) tests
- Add at least one light test validating `/faq` renders expected heading text

## Content Draft (initial)

Suggested FAQ questions:
1. What is this app for?
2. Why do I need to log in?
3. How do I hear pronunciation?
4. Can I edit a shared note?
5. How do I choose target language?
6. Where can I manage shared links?
7. What should I do first as a new user?

## Acceptance Criteria

- `/faq` is publicly accessible
- `/home` links to `/faq`
- share page links to `/faq`
- FAQ content is available in EN/ZH
- `npm run build` passes

## Verification Checklist

- Visit `/faq` directly while logged out
- From `/home`, navigate to `/faq`
- From `/share/[token]`, navigate to `/faq`
- Switch language and verify FAQ text changes
- Run `npm run build`
