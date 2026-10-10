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

---

# Part 1: Design (the only input of the Lovable prompt)

Lovable only designs. This part says **what** to build, in English, with nothing about how our
site works: no Sanity, no Nuxt, no field names, no translations, no theme values (the theme and
conventions are in the Lovable project knowledge).

## Pages

| Page | Prototype URL | Menu |
| ---- | ------------- | ---- |
|      |               |      |

## Sections (Designer)

| Order | `data-section` | Purpose | New / changed / unchanged |
| ----- | -------------- | ------- | ------------------------- |
| 1     | hero           |         | new                       |

For each new or changed section: what it shows, layout at 1440 / 768 / 375, states (with the
`?state=` names), motion, media.

## Content (English, in full)

Every text the prototype shows, item by item. This is the text Lovable puts on the page.

## Do not change

- Pages, sections or files Lovable must leave identical.

---

# Part 2: Implementation (our side, never sent to Lovable)

## Content model (Tech Lead)

| Element | Sanity field, i18n key or decoration |
| ------- | ------------------------------------ |
|         |                                      |

## Other locales (Product Owner)

The same content in every other locale (German), for the i18n files and the staging seed.

## Technical notes (Tech Lead, Frontend)

- Routes, schemas, seed, composables, Nuxt UI equivalents, token changes, ADRs, risks.

## Out of scope

-

## Open questions

-

## Definition of ready (gate D1)

- [ ] Goal, audience and primary call to action are stated
- [ ] Part 1 names every page with its URL, and every section with a `data-section`, a purpose and a status
- [ ] Layout at 375 / 768 / 1440 is described for every new or changed section
- [ ] States and motion are listed (or "none")
- [ ] The English content is complete in Part 1; every other locale exists in Part 2, or its provider and date are named
- [ ] Every element is classified: Sanity field, i18n key, or decoration
- [ ] Token changes are listed (or "none")
- [ ] Out of scope is written; no open question blocks the build

## Iterations (Lovable)

| #   | Date | Message id | Commit | Credits | Result |
| --- | ---- | ---------- | ------ | ------- | ------ |

## Approval (gate D2)

- Approved by, date, channel:
- Approved Lovable commit:
