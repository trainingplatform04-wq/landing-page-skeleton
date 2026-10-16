---
status: 'In Progress' # To Do | In Progress | Review | Done
assignee: 'Product Owner'
lastUpdated: '2026-10-16'
---

# Consent and analytics: developer guide

## 🔗 Resources

- **Design change**: none (documentation only)
- **Related Issues**: follows `docs/tasks/gtm-consent.md` (#17)
- **Gate G1**: waived by the owner on 2026-10-16 (documentation only).

## 👤 User Story

**As a** developer working on a fork of the skeleton,
**I want** a short guide to try the consent window locally and to add a tool, cookie or event,
**So that** I change consent and analytics without breaking the legal setup.

## ✅ Acceptance Criteria

- **Given** a fresh clone, **when** I read `docs/analytics/DEVELOPER_GUIDE.md`, **then** I know how to turn statistics on locally, reset my choice and check what loads.
- **Given** I add a tool, cookie or event, **when** I follow the checklist, **then** I touch every file that must change together and know a Privacy Officer review follows.
- **Given** the README, **when** I open the Documentation list, **then** it links the analytics and legal docs.
- No environment value appears in any file; `pnpm verify` is green.
