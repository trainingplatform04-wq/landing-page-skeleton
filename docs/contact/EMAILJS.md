# EmailJS: the contact form's two emails

Click by click, copy and paste: the contact form's emails on EmailJS's free plan, sent from a Gmail (or Google Workspace) mailbox. Every value below is filled in with the skeleton's demo business (Demo Studio Berlin, the imprint in `studio/seed/seed.copy.ts`); a client fork replaces them with the client's imprint. The legal side is in `docs/legal/go-live-checklist.md`; the env vars in `docs/deployment/DEPLOYMENT.md` §3.2.

## 1. What happens

```
Visitor sends the form
   │  the browser posts name, email and message to EmailJS (useContactForm)
   ▼
EmailJS ── template "Contact: owner"        → your Gmail (Reply goes to the visitor)
   └────── template "Contact: confirmation" → the visitor (linked as the auto-reply)
           both sent from your Gmail
```

- **One request, two emails**: the site sends the owner template; EmailJS sends the linked auto-reply itself.
- **The texts live in EmailJS**, not in the code or Sanity.
- **The honeypot**: a filled hidden field is a bot; the site sends nothing and still shows success.
- **The site needs three values**, all public: service id, template id, public key. Any empty: the contact page shows an email link.

## 2. The free plan

| Limit              | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Requests per month | 200; one message uses **2** (owner + confirmation): about 100 |
| Templates          | 2: exactly the two below; one confirmation holds DE and EN    |
| Above the quota    | Sending fails until next month; the visitor sees the error    |
| Email history      | 7 days in the dashboard (30 on paid plans): name, email, text |
| Footer             | "Email sent via EmailJS.com" under every email (a go-live lawyer item; paid plans remove it) |

Upgrade when messages near 100 a month: <https://www.emailjs.com/pricing/>.

## 3. Account and Gmail service

Production sends from a **Google Workspace** mailbox with Google's data processing agreement accepted; a free Gmail account has none and is for testing only (`docs/legal/go-live-checklist.md`).

1. Open <https://dashboard.emailjs.com/sign-up> → sign up with the Gmail address the emails will come from → confirm the email EmailJS sends you.
2. Left menu **Email Services** → **Add New Service** → **Gmail**.
3. Fill in:

   | Field      | Paste              |
   | ---------- | ------------------ |
   | Name       | `Platform mailbox` |
   | Service ID | `contact_service`  |

4. **Connect Account** → choose your Gmail → tick **Send email on your behalf** → **Continue**.
5. Leave **Send test email to verify configuration** ticked → **Create Service**. The test email arrives in your Gmail inbox.

## 4. Template 1: email to you (the owner)

1. Left menu **Email Templates** → **Create New Template**.
2. Tab **Settings** → fill in → **Save**:

   | Field       | Paste            |
   | ----------- | ---------------- |
   | Name        | `Contact: owner` |
   | Template ID | `contact_owner`  |

3. Tab **Content** → fill in the right-hand fields:

   | Field      | Paste                                        |
   | ---------- | -------------------------------------------- |
   | Subject    | `Neue Kontaktanfrage von {{name}}`           |
   | To Email   | your Gmail address (the one connected in §3) |
   | From Name  | `Demo Studio Berlin Website`                 |
   | From Email | tick **Use Default Email Address**           |
   | Reply To   | `{{email}}`                                  |
   | Bcc, Cc    | empty                                        |

4. Content box → **Edit Content** → **Code** (the `<>` button) → select all, delete, paste:

```html
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.5; color: #1f2937; max-width: 600px">
  <p style="margin: 0 0 16px">Neue Nachricht über das Kontaktformular.</p>
  <table cellpadding="0" cellspacing="0" style="margin: 0 0 16px; font-size: 15px">
    <tr><td style="padding: 2px 16px 2px 0; color: #6b7280">Name</td><td>{{name}}</td></tr>
    <tr><td style="padding: 2px 16px 2px 0; color: #6b7280">E-Mail</td><td>{{email}}</td></tr>
  </table>
  <p style="margin: 0 0 4px; color: #6b7280">Nachricht</p>
  <div style="margin: 0 0 24px; padding: 12px 16px; background: #f3f4f6; border-radius: 6px; white-space: pre-wrap">{{message}}</div>
  <p style="margin: 0; font-size: 13px; color: #6b7280">Auf diese E-Mail antworten: die Antwort geht direkt an {{name}}. Zugesagte Antwortzeit: 2 Werktage.</p>
</div>
```

5. **Save**.

`{{message}}` has **two** braces on purpose: EmailJS escapes it. Never three (`{{{message}}}`): that would insert the visitor's text as raw HTML. `white-space: pre-wrap` keeps the visitor's line breaks.

### What you receive (example)

```text
From:     Demo Studio Berlin Website <your Gmail>
Reply-To: anna.schmidt@example.de
Subject:  Neue Kontaktanfrage von Anna Schmidt

Neue Nachricht über das Kontaktformular.

Name     Anna Schmidt
E-Mail   anna.schmidt@example.de

Nachricht
┌──────────────────────────────────────────────────────────────┐
│ Guten Tag,                                                   │
│ ich habe seit einigen Wochen Rückenschmerzen und würde gern  │
│ ein Probetraining vereinbaren. Passt Dienstagabend?          │
│ Viele Grüße, Anna                                            │
└──────────────────────────────────────────────────────────────┘

Auf diese E-Mail antworten: die Antwort geht direkt an Anna Schmidt. Zugesagte Antwortzeit: 2 Werktage.
```

## 5. Template 2: confirmation to the visitor

1. **Email Templates** → **Create New Template**.
2. Tab **Settings** → fill in → **Save**:

   | Field       | Paste                   |
   | ----------- | ----------------------- |
   | Name        | `Contact: confirmation` |
   | Template ID | `contact_confirmation`  |

3. Tab **Content** → fill in:

   | Field      | Paste                                                      |
   | ---------- | ---------------------------------------------------------- |
   | Subject    | `Ihre Nachricht ist angekommen / Your message has arrived` |
   | To Email   | `{{email}}`                                                |
   | From Name  | `Demo Studio Berlin`                                       |
   | From Email | tick **Use Default Email Address**                         |
   | Reply To   | empty (a reply then goes to your Gmail, the sender)        |
   | Bcc, Cc    | empty                                                      |

4. Content box → **Edit Content** → **Code** (`<>`) → select all, delete, paste:

```html
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.5; color: #1f2937; max-width: 600px">
  <p style="margin: 0 0 16px">Hallo {{name}},</p>
  <p style="margin: 0 0 16px">vielen Dank für Ihre Nachricht. Sie ist bei uns angekommen, und wir antworten Ihnen innerhalb von 2 Werktagen.</p>
  <p style="margin: 0 0 4px; color: #6b7280">Ihre Nachricht:</p>
  <div style="margin: 0 0 16px; padding: 12px 16px; background: #f3f4f6; border-radius: 6px; white-space: pre-wrap">{{message}}</div>
  <p style="margin: 0 0 16px">Bei dringenden Anliegen erreichen Sie uns unter +49 30 0000000.</p>
  <p style="margin: 0 0 32px">Freundliche Grüße<br />Demo Studio Berlin</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 0 0 32px" />
  <p style="margin: 0 0 16px">Hello {{name}},</p>
  <p style="margin: 0 0 16px">thank you for your message. It has reached us, and we will answer within 2 business days.</p>
  <p style="margin: 0 0 4px; color: #6b7280">Your message:</p>
  <div style="margin: 0 0 16px; padding: 12px 16px; background: #f3f4f6; border-radius: 6px; white-space: pre-wrap">{{message}}</div>
  <p style="margin: 0 0 16px">For anything urgent, call us at +49 30 0000000.</p>
  <p style="margin: 0 0 32px">Kind regards<br />Demo Studio Berlin</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 0 0 16px" />
  <p style="margin: 0; font-size: 12px; color: #6b7280">Demo Studio Berlin · Musterstraße 1, 10115 Berlin · +49 30 0000000<br /><a href="https://landing-page-skeleton-webapp.vercel.app/impressum" style="color: #6b7280">Impressum</a> · <a href="https://landing-page-skeleton-webapp.vercel.app/datenschutz" style="color: #6b7280">Datenschutz</a> · <a href="https://landing-page-skeleton-webapp.vercel.app/en/imprint" style="color: #6b7280">Imprint</a> · <a href="https://landing-page-skeleton-webapp.vercel.app/en/privacy" style="color: #6b7280">Privacy</a></p>
</div>
```

5. **Save**.

### What the visitor receives (example)

```text
From:    Demo Studio Berlin <your Gmail>
To:      anna.schmidt@example.de
Subject: Ihre Nachricht ist angekommen / Your message has arrived

Hallo Anna Schmidt,

vielen Dank für Ihre Nachricht. Sie ist bei uns angekommen, und wir antworten Ihnen innerhalb von 2 Werktagen.

Ihre Nachricht:
┌──────────────────────────────────────────────────────────────┐
│ Guten Tag,                                                   │
│ ich habe seit einigen Wochen Rückenschmerzen und würde gern  │
│ ein Probetraining vereinbaren. Passt Dienstagabend?          │
│ Viele Grüße, Anna                                            │
└──────────────────────────────────────────────────────────────┘

Bei dringenden Anliegen erreichen Sie uns unter +49 30 0000000.

Freundliche Grüße
Demo Studio Berlin
──────────────────────────────────────────────────────────────
Hello Anna Schmidt,

thank you for your message. It has reached us, and we will answer within 2 business days.

Your message:
┌──────────────────────────────────────────────────────────────┐
│ (the same message)                                           │
└──────────────────────────────────────────────────────────────┘

For anything urgent, call us at +49 30 0000000.

Kind regards
Demo Studio Berlin
──────────────────────────────────────────────────────────────
Demo Studio Berlin · Musterstraße 1, 10115 Berlin · +49 30 0000000
Impressum · Datenschutz · Imprint · Privacy
```

Rules this text keeps (a fork that edits it keeps them too):

- **No advertising**: no offers, courses, newsletters or discount codes. Advertising in an automatic reply sent without consent is unlawful in Germany (BGH, VI ZR 134/15). Links to the imprint and privacy page are fine.
- **Company details**: a GmbH, UG or other registered company adds its legal form, register court and number, managing directors and VAT ID to the footer line (from the imprint).
- **Answer time**: "2 Werktage / 2 business days" appears only in the two templates; the site does not repeat it.

## 6. Link the confirmation as the auto-reply

1. **Email Templates** → open **Contact: owner** → tab **Auto-Reply**.
2. Choose **Contact: confirmation** → **Save**.
3. Leave **Contact: confirmation** without an auto-reply of its own.

## 7. Security settings

**Account** (top right) → tab **Security**:

| Setting                                        | Paste / set                                                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Domains (allowlist), one per line              | `https://landing-page-skeleton-webapp.vercel.app`<br>`https://landing-page-skeleton-webapp-develop.vercel.app`<br>`http://localhost:3000` |
| Allow EmailJS API for non-browser applications | **off** (only browsers may send)                                                                                                          |
| Use Private Key                                | **off** (the site sends from the browser; a private key would be public there)                                                            |

Then **Save**.

What these settings do and don't do: they stop sending from other websites' pages and casual misuse. They are **not** a lock: the three ids are public in the page, and a script can call EmailJS directly with a forged origin, skip the honeypot, and send any text to any address as a confirmation from your mailbox. The monthly quota caps the damage. The project accepts this risk (`docs/tasks/contact-auto-reply.md`, Risks); dropping `{{message}}` from the confirmation template removes the quoted text from such emails.

Feature deployments (`-pr-<number>`) are not on the allowlist, so their form fails unless you add the address for a test (§10).

## 8. The three values for the site

| Env var                           | Value                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_EMAILJS_SERVICE_ID`  | `contact_service` (chosen in §3)                                                   |
| `NUXT_PUBLIC_EMAILJS_TEMPLATE_ID` | `contact_owner` (chosen in §4)                                                     |
| `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY`  | **Account** → tab **General** → **Public Key** (copy it; the one value not chosen) |

They go in `.env` locally and in Vercel (Production, Development, Feature, Local): `docs/deployment/DEPLOYMENT.md` §3.2. Never commit the values (operating-model §6).

## 9. Data processing agreement

1. Read and accept EmailJS's DPA: <https://www.emailjs.com/legal/data-protection-agreement/> (EmailJS Pte. Ltd., Singapore; servers in the USA; transfers under standard contractual clauses).
2. Production mailbox: in the Google Workspace Admin console → **Account → Account settings → Legal and compliance**, accept Google's **Cloud Data Processing Addendum**.
3. Tick both rows (EmailJS, Google Workspace) in `docs/legal/go-live-checklist.md` §5; the privacy page names both (Studio → Privacy).

## 10. Test

On a pull request's Feature deployment: add `https://landing-page-skeleton-webapp-pr-<number>.vercel.app` to the allowlist (§7) → test as below → remove it again afterwards.

1. On Development (or the Feature deployment above), send the form in German and in English with an address you can read.
2. Your Gmail gets **Neue Kontaktanfrage von …**; **Reply** addresses the visitor.
3. The visitor address gets the confirmation from your Gmail, not in spam, with the message and its line breaks.
4. **EmailJS → Email History** shows two emails per message.
