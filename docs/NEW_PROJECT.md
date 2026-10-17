# Start a new project from the skeleton

The skeleton is a GitHub **template repository**: each client project starts from it, independent, with a clean history. An AI agent can run these steps with `/new-project <client>` (`.ai/shared/workflows/new-project.md`).

## 1. Create the repository

1. On the skeleton's GitHub page: **Use this template → Create a new repository** (private). Once, on the skeleton: Settings → General → **Template repository**.
2. Clone it, `pnpm install`, then rename: `name` in `package.json`, `site.name` in `nuxt.config.ts`, `title` in `studio/sanity.config.ts`.
3. Optional: keep a link to pull later skeleton fixes: `git remote add skeleton <skeleton URL>`, then `git fetch skeleton` and `git cherry-pick <commit>` when one is worth taking.

## 2. Accounts and environments

Follow `docs/deployment/DEPLOYMENT.md` from the top: a Sanity project with the `staging` and `production` datasets, the Vercel projects (web app and Studio), the GitHub secrets and variables, the `.env` files from `.env.example` and `studio/.env.example`.

## 3. Choose the examples

Read [`SKELETON.md`](SKELETON.md). For every example the client doesn't need, follow its removal row in one PR, then `pnpm typegen`, `pnpm verify` and E2E. Keep the core.

## 4. Brand and content

| What                | Where                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Colors              | `app.config.ts` (`primary`, `neutral`), tokens in `assets/css/main.css`                                  |
| Fonts               | `assets/css/main.css` (self-hosted, never a font CDN)                                                    |
| Menu                | `constants/navigation.constants.ts`                                                                      |
| Languages and URLs  | `constants/i18n.constants.ts`, `constants/routes.constants.ts`                                           |
| UI texts            | `i18n/locales/`                                                                                          |
| Demo content        | `studio/seed/seed.copy.ts` and `seed.magazine.ts` (the client's real words when known), `seed.images.ts` |
| Custom page designs | `/design <page>` (the design track, `docs/design/DESIGN_WORKFLOW.md`)                                    |

## 5. Before going live

1. Analytics: `docs/analytics/GTM.md` (optional; without `NUXT_PUBLIC_GTM_ID` nothing is tracked).
2. Contact form: an EU form service in `NUXT_PUBLIC_CONTACT_FORM_ACTION` (without it, the contact page shows an email link).
3. Legal: `docs/legal/go-live-checklist.md` (imprint, privacy text checked by a lawyer).
4. Editors write the production content; the first release follows `.ai/shared/workflows/release.md` (Gate G2).
