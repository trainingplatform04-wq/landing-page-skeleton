---
status: 'Review' # To Do | In Progress | Review | Done
assignee: 'Tech Lead'
lastUpdated: '2026-11-23'
---

# Contact form: two emails through EmailJS

## 🔗 Resources

- **Design change**: none
- **Related Issues**: none
- **Service**: [EmailJS](https://www.emailjs.com/) Free (200 requests a month; each message uses two)

## 👤 User Story

**As a** visitor who sends the contact form,
**I want** an email from the platform's own address confirming that my message arrived, with my message and when to expect an answer,
**So that** I know my request was received and have a copy of what I wrote.

## ✅ Acceptance Criteria

- **Given** a configured EmailJS account, **When** a visitor sends the form, **Then** two emails go out from the platform's own mailbox: the owner gets the visitor's name, email and message, and the visitor gets a confirmation.
- **Given** the confirmation, **Then** it greets the visitor by name, says the message was received, quotes the message and says when an answer follows, in German and English.
- **Given** the owner's email, **When** the owner presses Reply, **Then** the reply goes to the visitor.
- **Given** a bot that fills the hidden honeypot field, **When** the form is sent, **Then** nothing reaches EmailJS and the bot sees the normal success message.
- **Given** the privacy page, **Then** it names EmailJS as the processor and says the visitor receives a confirmation email.
- **Given** no EmailJS configuration, **Then** the contact page shows the email link as today.

## Edge cases

- German and English visitors: the free plan has two templates, so the confirmation holds both languages.
- A mistyped address: the confirmation bounces; the owner still gets the message.
- EmailJS down or the monthly quota used up: the visitor sees the error toast, as today.

## Out of scope / later

- Booking sessions with calendar invitations (a separate feature).
- Editing the email text in Sanity: EmailJS keeps the templates in its dashboard.

## 🧭 Plan (Tech Lead, Gate G1)

### Contract

- `NUXT_PUBLIC_EMAILJS_SERVICE_ID`, `NUXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY` replace `NUXT_PUBLIC_CONTACT_FORM_ACTION` (public values; none is a secret). All three set: the form shows; otherwise the email link.
- `useContactForm(successText)` keeps its signature and `{ isEnabled, send }`. `send` posts JSON to the EmailJS send API: `service_id`, `template_id`, `user_id`, `template_params: { name, email, message }`. A filled honeypot resolves `true` without a request.
- The auto-reply is the second template, linked to the first in the EmailJS dashboard; the code sends one request.

### Files

```
composables/useContactForm/useContactForm.ts        EmailJS request, honeypot check
composables/useContactForm/useContactForm.spec.ts   request shape, honeypot, disabled without config
constants/contact.constants.ts                      the EmailJS send URL (new)
nuxt.config.ts                                      runtime config: the three ids
.env.example                                        the three variables
tests/e2e/contact.spec.ts, tests/e2e/sanity/*        EmailJS stood in by the fixture server
studio/seed/seed.copy.ts                            privacy text DE/EN: EmailJS, the confirmation
docs/contact/EMAILJS.md                             dashboard setup step by step, both templates DE/EN (new)
docs/deployment/DEPLOYMENT.md, docs/NEW_PROJECT.md,
docs/conventions/ARCHITECTURE.md                    the new variables and the data flow
docs/legal/go-live-checklist.md                     processor row: EmailJS, transfer outside the EU
```

### Owner → tasks

1. backend-engineer: composable, constant, runtime config, specs.
2. backend-engineer: seed privacy text DE/EN, E2E fixtures.
3. devops-engineer: `.env.example`, DEPLOYMENT, NEW_PROJECT.
4. qa-engineer: E2E, local gates.
5. Review: fresh Code Reviewer and Privacy Officer subagents (the form target changes).
6. Owner (blocker, not code): EmailJS account, mailbox, two templates, domain allowlist, the three values in `.env` and Vercel, the data processing agreement.

### Risks

- **Privacy**: EmailJS does not state EU-only processing; the privacy text names it and the transfer, and the owner signs its data processing agreement.
- **Misuse**: the confirmation quotes the message to any typed address from the platform's own mailbox. Honeypot, the EmailJS domain allowlist and the quota cap limit it.
- **Quota**: about 100 messages a month; above it, sending fails until the next month (error toast).
- **Performance**: none; no script is loaded, one request on send.
