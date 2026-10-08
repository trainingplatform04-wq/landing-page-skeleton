---
id: NNNN # shared sequence with docs/design/changes
page: home # a page of constants/routes.constants.ts, or a new one
kind: new-page # new-page | change | design-system
status: draft # draft → approved (gate D1) → built → design-approved (gate D2) | discarded
lastUpdated: 'YYYY-MM-DD'
---

# Brief NNNN: <page>, <what>

## Intent

One paragraph, in the human's words: what we want and why.

## Product (Product Owner)

- **Goal**: what a visitor does next; how we know it worked.
- **Audience**: who, from where, on which device first.
- **Message**: the one sentence to remember; the proof.
- **Calls to action**: label → target, one primary per section.

## Sections (Designer)

| Order | `data-section` | Purpose | New / changed / unchanged |
| ----- | -------------- | ------- | ------------------------- |
| 1     | hero           |         | new                       |

For each new or changed section: layout at 375 / 768 / 1440, states, motion, media.

## Content (every locale)

| Section | Element  | DE  | EN  | Sanity field or i18n key |
| ------- | -------- | --- | --- | ------------------------ |
| hero    | headline |     |     | homePage.hero.title      |

## Technical notes (Tech Lead, Frontend)

- Route and schema impact; reused components; Nuxt UI equivalents; token changes; risks.

## Out of scope

-

## Open questions

-

## Definition of ready (gate D1)

- [ ] Goal, audience and primary call to action are stated
- [ ] Every section has a `data-section` name, a purpose and a status
- [ ] Layout at 375 / 768 / 1440 is described for every new or changed section
- [ ] States and motion are listed (or "none")
- [ ] Content exists in every locale, or its provider and date are named
- [ ] Every element is classified: Sanity field, i18n key, or decoration
- [ ] Token changes are listed (or "none")
- [ ] Out of scope is written; no open question blocks the build

## Iterations (Lovable)

| #   | Date | Message id | Commit | Credits | Result |
| --- | ---- | ---------- | ------ | ------- | ------ |

## Approval (gate D2)

- Approved by, date, channel:
- Approved Lovable commit:
