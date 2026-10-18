# Deployment Guide: From Zero to Production

> **The only deployment document of this repository.** It takes you from "I have nothing" to
> "development and production are live and deploy themselves", step by step, then serves as the
> reference for day-to-day operations.
>
> If the code and this document disagree, one of them is a bug: fix it in the same PR.

**Who this is for:** someone setting this project up for the first time, with no prior Vercel,
Sanity or GitHub Actions experience. Every click is written down. Follow the parts **in order**.

**Time needed:** about 1 h 30 the first time.

---

## Table of contents

- [Part 0: Understand what you are building (10 min)](#part-0-understand-what-you-are-building)
- [Part 1: Accounts and tools](#part-1-accounts-and-tools)
- [Part 2: Sanity (content backend)](#part-2-sanity-content-backend)
- [Part 3: Vercel project #1: the Web App](#part-3-vercel-project-1-the-web-app)
- [Part 4: Vercel project #2: the Studio](#part-4-vercel-project-2-the-studio)
- [Part 5: Vercel token and IDs for GitHub](#part-5-vercel-token-and-ids-for-github)
- [Part 6: GitHub (the deployer)](#part-6-github-the-deployer)
- [Part 7: Your laptop (local development)](#part-7-your-laptop-local-development)
- [Part 8: First development deployment](#part-8-first-development-deployment)
- [Part 9: First production release](#part-9-first-production-release)
- [Part 10: Daily workflow](#part-10-daily-workflow)
- [Part 11: Reference](#part-11-reference)
- [Part 12: Runbooks](#part-12-runbooks)
- [Part 13: Troubleshooting](#part-13-troubleshooting)
- [Part 14: Golden rules](#part-14-golden-rules)

---

## Part 0: Understand what you are building

### 0.1 One repository, two apps, three environments

| App         | What it is                                            | Code in         | Who uses it                    |
| ----------- | ----------------------------------------------------- | --------------- | ------------------------------ |
| **Web App** | The public website (Nuxt 4, server-side rendered)     | repository root | Visitors                       |
| **Studio**  | The content editor (Sanity Studio, a single-page app) | `studio/`       | Content editors (login needed) |

Both apps talk to **one Sanity project** that holds the content in two **datasets**
(think "two separate databases"): `development` and `production`.

|                 | Git branch | Web App URL (example)                                         | Studio URL (example)                                      | Dataset                   | Vercel environment        |
| --------------- | ---------- | ------------------------------------------------------------- | --------------------------------------------------------- | ------------------------- | ------------------------- |
| **Production**  | `main`     | `https://landing-page-skeleton-webapp.vercel.app`             | `https://landing-page-skeleton-studio.vercel.app`         | `production`              | Production                |
| **Development** | `develop`  | `https://landing-page-skeleton-webapp-develop.vercel.app`     | `https://landing-page-skeleton-studio-develop.vercel.app` | `development`             | Preview, branch `develop` |
| **Feature**     | each PR    | `https://landing-page-skeleton-webapp-pr-<number>.vercel.app` | not deployed (uses the Development Studio)                | `development` (read only) | Preview, all branches     |
| **Local**       | any        | `http://localhost:3000`                                       | `http://localhost:3333`                                   | `development`             | none (`.env` files)       |

Production and Development always get **both** apps, deployed together from the same commit. A
Feature environment is one pull request: its own address, created once its checks pass and removed
when the PR is merged or closed. Every environment has **the same variables**; only their values differ.

### 0.2 Who does what

```
            ┌──────────────── GitHub ────────────────┐
 you ──push─▶  repository  ──▶  GitHub Actions        │   (the ONLY deployer)
            │                  ci.yml · deploy.yml     │
            └───────────────────────┬────────────────┘
                     VERCEL_TOKEN   │  vercel pull / build / deploy / alias
                                    ▼
            ┌──────────────── Vercel ────────────────┐
            │ project "webapp"      project "studio"  │   (hosting + env vars)
            └──────────┬──────────────────┬──────────┘
                       │ reads content    │ reads + writes content
                       ▼                  ▼
            ┌──────────────── Sanity ────────────────┐
            │ dataset "development"  "production"     │   (content)
            └─────────────────────────────────────────┘
```

- **GitHub** stores the code and runs the pipeline. GitHub Actions is the **only** thing allowed to deploy.
  Vercel's own "deploy on every push" is switched **off** (`"git": { "deploymentEnabled": false }` in
  `vercel.json` and `studio/vercel.json`), so nothing reaches users without passing the tests.
- **Vercel** hosts both apps and is the **single source of truth for app configuration** (env vars).
- **Sanity** stores the content. Datasets are **public** (read-only for anonymous visitors), so the
  website needs **no token at all**. Editors log into the Studio with their own Sanity account.

### 0.3 Vocabulary (read once, refer back)

| Word                     | Meaning                                                                                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deployment**           | One immutable copy of an app built from one commit. Each one gets its own random URL like `landing-page-skeleton-webapp-8f3k2la1x-myteam.vercel.app`. Old deployments stay online.                                                                    |
| **Vercel "Production"**  | Vercel's environment for deployments made with `--prod`. They automatically receive the project's production domain. **= our Production.**                                                                                                            |
| **Vercel "Preview"**     | Vercel's environment for every other deployment. Its rows for **all branches** are our **Feature** (pull requests); its rows for the branch `develop` are our **Development**. Vercel Hobby has no custom environments, and Preview can't be renamed. |
| **Vercel "Development"** | Vercel's environment for a laptop (`vercel env pull`): our **Local**. Not used by the pipeline; it keeps the same keys as the others.                                                                                                                 |
| **Alias**                | A fixed, human-friendly hostname that _points_ to one deployment. Our Development and Feature URLs are aliases that the pipeline moves to the newest deployment after each deploy. [Docs](https://vercel.com/docs/cli/alias)                          |
| **Env var**              | A setting injected at build/run time (`NUXT_PUBLIC_SANITY_DATASET=development`). Same code, different values per environment.                                                                                                                         |
| **Dataset**              | A separate content database inside one Sanity project. [Docs](https://www.sanity.io/docs/datasets)                                                                                                                                                    |
| **CORS origin**          | A website address Sanity allows to call its API from a browser. Anything not listed is blocked. [Docs](https://www.sanity.io/docs/cors)                                                                                                               |
| **Smoke test**           | A quick automated check, run right after deploying, that proves the live site really answers with our app (not an error page or a login wall).                                                                                                        |
| **Secret / Variable**    | GitHub Actions settings. A _secret_ is hidden in logs (`VERCEL_TOKEN`, `SANITY_TOKEN`); a _variable_ is plain text (IDs, URLs).                                                                                                                       |

### 0.4 How the pipeline flows

```
 feat/* ──PR──▶ develop ──PR──▶ main
    │              │              │
    ▼              ▼              ▼
  ci.yml         deploy.yml      deploy.yml
 checks         CI → deploy     CI → deploy
 → deploy       both apps       both apps (--prod)
   -pr-<n>      → alias         → smoke test
 → web perf.    → smoke test
 → PR report    → seed
                → web perf.
   FEATURE        DEVELOPMENT    PRODUCTION
 (removed when the PR closes: feature-cleanup.yml)
```

---

## Part 1: Accounts and tools

### 1.1 Accounts (create them now, all have a free tier)

| Service | Sign-up link                                          | What you need                                                |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| GitHub  | <https://github.com/signup>                           | **Admin** on the repository (to set secrets/variables)       |
| Vercel  | <https://vercel.com/signup> (sign up **with GitHub**) | **Owner** of the Vercel team that will hold the two projects |
| Sanity  | <https://www.sanity.io/login/sign-up>                 | **Administrator** of the Sanity project                      |

> 💡 **Plans.** Vercel **Hobby** (free) forbids commercial use: if the site earns money, use
> [Vercel Pro](https://vercel.com/pricing). GitHub **Free** has no branch protection on private repos
> (this is why CI re-runs before every deploy, see [§11.2](#112-pipeline-files)).
> Sanity's free plan is enough to start: [pricing](https://www.sanity.io/pricing).

### 1.2 Tools on your laptop

| Tool                  | Install                                                                                                                                                                                           | Check               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Git                   | <https://git-scm.com/downloads>                                                                                                                                                                   | `git --version`     |
| Node.js **24**        | via a version manager: [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) (Windows) or [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux), then `nvm install 24` and `nvm use 24` | `node -v` → `v24.x` |
| GitHub CLI (optional) | <https://cli.github.com>                                                                                                                                                                          | `gh --version`      |
| pnpm                  | `npm install --global pnpm` (pnpm 10 or newer: inside the repo it switches itself to the one pinned in `package.json`; pnpm 9 does not)                                                           | `pnpm -v`           |

You do **not** need the Vercel CLI on your laptop: only the pipeline deploys.

> 🪟 **Windows:** run every command in this guide in **Git Bash** (installed with Git), not in
> PowerShell or `cmd`. Commands such as `cp` and `CI=1 pnpm …` only work
> in a POSIX shell.

### 1.3 Your setup notebook

Copy this table into a private note and fill it in as you go. Later parts say **📝 Write down** when a value appears.

Every ID below is **unique to your accounts**: never copy one from another project or from an
example. Each row says exactly where to read yours.

| #   | Value                     | Format                                     | Where to find it                                                                                                  | Step     |
| --- | ------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------- |
| N1  | Sanity project ID         | 8 lowercase letters/digits                 | <https://www.sanity.io/manage> → your project → shown under the project name (also in the page URL)               | Part 2.1 |
| N2  | Vercel team ID            | starts with `team_`                        | Vercel → team switcher (top-left) → your team → **Settings → General → Team ID**                                  | Part 5.2 |
| N3  | Web App Vercel project ID | starts with `prj_`                         | Vercel → project `…-webapp` → **Settings → General → Project ID**                                                 | Part 3.5 |
| N4  | Studio Vercel project ID  | starts with `prj_`                         | Vercel → project `…-studio` → **Settings → General → Project ID**                                                 | Part 4.5 |
| N5  | Web App production URL    | `https://<webapp-project-name>.vercel.app` | Vercel → project `…-webapp` → **Settings → Domains**                                                              | Part 3.5 |
| N6  | Studio production URL     | `https://<studio-project-name>.vercel.app` | Vercel → project `…-studio` → **Settings → Domains**                                                              | Part 4.5 |
| N7  | Web App development URL   | `https://<a-free-name>.vercel.app`         | **You choose it** (e.g. `<webapp-project-name>-develop`)                                                          | Part 3.0 |
| N8  | Studio development URL    | `https://<a-free-name>.vercel.app`         | **You choose it** (e.g. `<studio-project-name>-develop`)                                                          | Part 4.0 |
| N9  | Vercel token              | long random string, **secret**             | <https://vercel.com/account/settings/tokens> → **Create Token** (shown only once: store it in a password manager) | Part 5.1 |

---

## Part 2: Sanity (content backend)

### 2.1 Create the project

1. Open <https://www.sanity.io/manage> → **Create new project**.
2. Name it (e.g. `Landing Page`), pick the free plan, confirm.
3. On the project page, the **Project ID** is shown under the project name.
   📝 **Write down N1.** It is not a secret: it ends up in the browser.

### 2.2 Create the two datasets (both public)

1. Project page → **Datasets** tab.
2. If a `production` dataset already exists, keep it but **check that its visibility is Public**
   (if not: open it → change visibility to **Public**). Otherwise **Add dataset** → name `production` →
   visibility **Public**. A private dataset makes the site render empty pages: it has no token.
3. **Add dataset** → name `development` → visibility **Public**.

Why public? The website only **reads published** content and must work **without any token**
(nothing secret can leak). Drafts stay private; writing always requires a logged-in editor.

> ⚠️ Public means anyone can read the content of the dataset. **Never put confidential data in
> `development` or `production`.**

CLI alternative (from `studio/`, after Part 7):

```bash
pnpm exec sanity login
pnpm exec sanity dataset create development --visibility public
pnpm exec sanity dataset visibility set production public
```

### 2.3 CORS origins (who may call Sanity from a browser)

Project page → **API** tab → **CORS origins** → **Add CORS origin**, once per row.
Type the origin **exactly** (scheme + host, no trailing slash) and tick **Allow credentials** only where shown:

| Origin                                       | Allow credentials | Why                                        |
| -------------------------------------------- | ----------------- | ------------------------------------------ |
| `http://localhost:3000`                      | ❌ No             | Web App on your laptop (read only)         |
| `http://localhost:3333`                      | ✅ Yes            | Studio on your laptop (editors log in)     |
| N5 (Web App production)                      | ❌ No             | Public site reads content                  |
| N7 (Web App development)                     | ❌ No             |                                            |
| `https://<webapp-project-name>-*.vercel.app` | ❌ No             | Feature: the address of every pull request |
| N6 (Studio production)                       | ✅ Yes            | Editors log in                             |
| N8 (Studio development)                      | ✅ Yes            |                                            |

> ⚠️ **One wildcard only, never with credentials.** Every pull request has its own address, so the
> Feature row is a pattern, anchored to your web app's project name (if Sanity refuses a partial
> label: to your team, `https://*-<team-slug>.vercel.app`, the form Sanity's docs recommend), and
> **without** credentials: it only lets those pages read the public dataset, which anyone can read
> anyway. Never add a platform-wide pattern (`https://*.vercel.app`), and never a wildcard with
> credentials: anyone can create a Vercel project matching the pattern and act as your logged-in
> editors. Studio origins stay exact.

You can add rows for URLs you'll only know later (N5–N8): come back here after Part 4 if needed.

### 2.4 Tokens: one, for the development seed

The website and the Studio use **no token**. The only one is the development seed's (`github-seed-development`, created in [§6.2](#62-the-secret-one-value-stored-twice)). Delete any other token under **API → Tokens** unless you know exactly what uses it.

### 2.5 Invite the editors

Project page → **Members** → **Invite members** → email + role (**Editor** for content people,
**Administrator** only for whoever manages the project). They log into the Studio with that account.

---

## Part 3: Vercel project #1: the Web App

### 3.0 Choose the names first

- **Project name:** `landing-page-skeleton-webapp`. Vercel gives the project the production domain
  `https://<project-name>.vercel.app` if it is free worldwide.
- **Development name:** `landing-page-skeleton-webapp-develop.vercel.app`. This alias is **created by the
  pipeline** on the first development deploy ([§8.2](#82-how-the-development-url-is-created)). The name must be
  unused on all of Vercel. 📝 **Write down N7** (with `https://`).
- **Feature names** (`<project-name>-pr-<number>.vercel.app`) are created and removed by the pipeline:
  nothing to choose. Keep the project name short enough for `-pr-<number>` (63 characters at most).

### 3.1 Import the repository

1. Open <https://vercel.com/new>. Top-left, select **your team** (the scope that will own the projects).
2. **Import Git Repository** → pick your repository.
   Not listed? Click **Adjust GitHub App Permissions** / **Configure GitHub App** and grant access to it.
3. Configure:
   - **Project Name:** `landing-page-skeleton-webapp`
   - **Framework Preset:** `Nuxt.js`
   - **Root Directory:** `./` (leave as is)
   - Build/Install commands: leave defaults (`vercel.json` pins `pnpm build` and `pnpm install --frozen-lockfile`).
   - Environment Variables: skip for now (Part 3.2).
4. Click **Deploy**. This first deployment will **fail** with `Missing required env: …`: that is
   expected and harmless (the build refuses to run without its configuration). Click
   **Continue to Dashboard** / open the project.

### 3.2 Environment variables

Project → **Settings** → **Environment Variables**. Every key exists in **every** column below,
with that column's value. For each cell: **Add** → **Key** and **Value**, keep **Sensitive OFF**, pick the target:

- **Production**: tick **Production** only.
- **Development** (`develop`): tick **Preview** only → **Select a custom Preview branch** → `develop`.
  These rows override the Feature rows on `develop`: add **every** key here, not only those that differ.
- **Feature** (pull requests): tick **Preview** only, branch left empty (all branches).
- **Local**: tick **Development** only (Vercel's laptop environment, for `vercel env pull`).

| Key                                 | Production         | Development (Preview · `develop`)           | Feature (Preview)                           | Local (Development)                         |
| ----------------------------------- | ------------------ | ------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `NUXT_PUBLIC_SANITY_PROJECT_ID`     | N1                 | N1                                          | N1                                          | N1                                          |
| `NUXT_PUBLIC_SANITY_DATASET`        | `production`       | `development`                               | `development`                               | `development`                               |
| `NUXT_PUBLIC_SITE_URL`              | N5                 | N7                                          | any URL, replaced by `-pr-<number>` ¹       | `http://localhost:3000`                     |
| `NUXT_SITE_ENV`                     | `production`       | `development`                               | `feature`                                   | `local`                                     |
| `NUXT_PUBLIC_SITE_NAME` ²           | site name          | same                                        | same                                        | same                                        |
| `NUXT_PUBLIC_CONTACT_FORM_ACTION` ² | form endpoint      | a test form (never the production endpoint) | a test form (never the production endpoint) | a test form (never the production endpoint) |
| `NUXT_PUBLIC_GTM_ID` ²              | production `GTM-…` | development `GTM-…`                         | development `GTM-…`                         | development `GTM-…`                         |

¹ The **Deploy feature** job writes `https://<project-name>-pr-<number>.vercel.app` for each pull
request, so canonical links, hreflang and the sitemap of a PR deployment use its own address.

² The **key** is required in every environment like the others; its **value** may be empty where
the feature is off (no GTM container yet: no statistics; no form endpoint: an email link). Development
and Feature are public and show only the demo privacy text, so their contact form posts to a test
form, never to the client's real one.

Rules:

- **Sensitive must be OFF.** Sensitive values can't be read by `vercel pull`, which the pipeline
  needs. None of these values are secret anyway (they are sent to the browser).
  If you can't switch it off, a team policy forces it: **Team Settings → Security & Privacy →
  Enforce Sensitive Environment Variables** → disable.
- Paste values **without spaces or line breaks** around them.
- `NUXT_SITE_ENV=production` is the **only** value that lets search engines index the site;
  Development and Feature always answer `noindex`.
- `NUXT_PUBLIC_CONTACT_FORM_ACTION` is the endpoint URL of your form at an **EU-hosted** form
  service. The site sends each message there in the background (a `POST` from the browser with
  the fields `name`, `email`, `message` and expects a JSON answer;
  the service emails you. Pick a service that accepts such posts from your domain (CORS), answers
  JSON when asked (`Accept: application/json`). Sign a
  data processing agreement with it. Without it, the contact page shows an email link.
- `NUXT_PUBLIC_GTM_ID` is the Google Tag Manager container of the environment: the production
  container for **Production**, the shared development container for **Development**, **Feature**
  and **Local**. GTM loads only after a visitor accepts statistics; empty, nothing
  analytics-related loads and the consent window does not offer statistics. Creating the
  containers: [docs/analytics/GTM.md](../analytics/GTM.md). With the CLI (it asks for the value):

  ```bash
  pnpm dlx vercel@61.0.0 env add NUXT_PUBLIC_GTM_ID production    # GTM-… of the production container
  pnpm dlx vercel@61.0.0 env add NUXT_PUBLIC_GTM_ID preview develop   # development container (Development)
  pnpm dlx vercel@61.0.0 env add NUXT_PUBLIC_GTM_ID preview           # same container, all branches (Feature)
  pnpm dlx vercel@61.0.0 env add NUXT_PUBLIC_GTM_ID development       # same container (Local)
  ```

### 3.3 Build settings

Project → **Settings** → **Build and Deployment**:

- **Node.js Version:** `24.x` (must match `.nvmrc` and `engines` in `package.json`). **Save.**

Project → **Settings** → **Git**:

- Keep the repository **connected** (it links deployments to commits in the dashboard).
- **Ignored Build Step:** `Automatic`. Auto-deploys are already off through `vercel.json`.

### 3.4 Deployment Protection: switch it OFF ⚠️

Project → **Settings** → **Deployment Protection** → **Vercel Authentication** → set to
**Disabled** → **Save**.

Why this matters: new Vercel projects protect **Preview** deployments by default ("Standard
Protection"). Development and Feature **are** Preview deployments, so their URLs would answer
`HTTP 302 → vercel.com/sso-api` (a Vercel login page) to everyone, including the smoke test, which
then fails with `answered HTTP 302 (auth wall, redirect or unreachable?)`. Production is never
affected, which makes this easy to miss.
[Docs](https://vercel.com/docs/deployment-protection)

Development and Feature become publicly reachable. That is fine for a landing page (they are
`noindex` and show only development content) and required: PageSpeed Insights audits every PR
address without logging in.

### 3.5 Collect the IDs and production URL

- **Settings → General → Project ID** (starts with `prj_`). 📝 **Write down N3.**
- **Settings → Domains:** the domain listed (e.g. `landing-page-skeleton-webapp.vercel.app`) is the
  production URL. If Vercel added a suffix because the name was taken, use the **real** value.
  📝 **Write down N5** (with `https://`). If it differs from what you used in Part 3.2, fix
  `NUXT_PUBLIC_SITE_URL` (Production) now.

---

## Part 4: Vercel project #2: the Studio

Same repository, imported a **second** time, with a different root directory.

### 4.0 Choose the names

- **Project name:** `landing-page-skeleton-studio` → production `https://landing-page-skeleton-studio.vercel.app`.
- **Development name:** `landing-page-skeleton-studio-develop.vercel.app`. 📝 **Write down N8.**

### 4.1 Import the repository again

1. <https://vercel.com/new> → same team → **Import** the same repository.
2. Configure:
   - **Project Name:** `landing-page-skeleton-studio`
   - **Root Directory:** click **Edit** → select **`studio`** → **Continue**. ⚠️ Most important setting.
   - **Framework Preset:** `Sanity` (or `Other`). The build and output are pinned in `studio/vercel.json`
     (`pnpm build` → `dist/`, plus a rewrite so Studio deep links survive a page refresh).
3. **Deploy** → it fails with `[studio] Missing or invalid env`: expected. Open the project.

### 4.2 Environment variables

Same procedure and targets as [§3.2](#32-environment-variables) (Sensitive **OFF**, every key in every column):

| Key                        | Production   | Development (Preview · `develop`) | Feature (Preview) | Local (Development) |
| -------------------------- | ------------ | --------------------------------- | ----------------- | ------------------- |
| `SANITY_STUDIO_PROJECT_ID` | N1           | N1                                | N1                | N1                  |
| `SANITY_STUDIO_DATASET`    | `production` | `development`                     | `development`     | `development`       |
| `NUXT_SITE_ENV` ³          | `production` | `development`                     | `feature`         | `local`             |

The Studio isn't deployed for pull requests; CI builds it with the Feature values.

³ Not read by the Studio (it reads only the `SANITY_STUDIO_*` keys). The project already had it, so it stays, with the same value as the web app, in every environment.

### 4.3 Build settings

- **Settings → Build and Deployment → Node.js Version:** `24.x`. **Save.**
- Same page, **Root Directory** section: `studio`, and **Include files outside the root directory
  in the Build Step: Enabled** (the Studio imports shared files from `constants/` and `utils/`).
- **Settings → Git → Ignored Build Step:** `Automatic`.

### 4.4 Deployment Protection: OFF ⚠️

**Settings → Deployment Protection → Vercel Authentication → Disabled → Save.**
Exactly as [§3.4](#34-deployment-protection-switch-it-off-). The Studio has its own Sanity login,
so a second wall adds nothing but breaks the smoke test.

### 4.5 Collect the IDs and production URL

- **Settings → General → Project ID.** 📝 **Write down N4.**
- **Settings → Domains.** 📝 **Write down N6.**

Back to [Part 2.3](#23-cors-origins-who-may-call-sanity-from-a-browser): make sure N5–N8 are in the CORS list.

---

## Part 5: Vercel token and IDs for GitHub

### 5.1 Create the deploy token

1. Open <https://vercel.com/account/settings/tokens> → **Create Token**.
2. **Name:** `github-actions-<repository-name>`; **Scope:** your team; **Expiration:** 1 year.
3. **Create** → copy the token **now** (it is shown only once). 📝 **N9**, in a password manager.
4. Put a calendar reminder 2 weeks before expiry ([§12.5](#125-rotate-the-vercel-token)).

### 5.2 Team ID

Open your team's **Settings → General** (URL `https://vercel.com/teams/<team-slug>/settings`) →
**Team ID** (`team_…`). 📝 **Write down N2.**
(Personal account without a team: **Account Settings → General → Vercel ID**, starts with `usr_`.)

---

## Part 6: GitHub (the deployer)

All URLs below: replace `<owner>/<repo>` with yours: both appear in your repository's address, `https://github.com/<owner>/<repo>`.

### 6.1 Allow GitHub Actions

`https://github.com/<owner>/<repo>/settings/actions` (**Settings → Actions → General**):

- **Actions permissions:** _Allow all actions and reusable workflows_.
- **Workflow permissions:** _Read repository contents and packages permissions_ (each workflow
  declares its own minimal `permissions:`). **Save.**

### 6.2 The secret (one value, stored twice)

1. `https://github.com/<owner>/<repo>/settings/secrets/actions` → **Secrets** tab → **New repository secret**:

   | Name           | Value |
   | -------------- | ----- |
   | `VERCEL_TOKEN` | N9    |

2. `https://github.com/<owner>/<repo>/settings/secrets/dependabot` (**Settings → Secrets and variables →
   Dependabot**) → **New repository secret** → the same `VERCEL_TOKEN` = N9.

Why twice? PRs opened by Dependabot ([§6.4](#64-dependabot-optional-but-recommended)) **can't read
Actions secrets**, only Dependabot secrets. Without this copy, every Dependabot PR fails CI at
`vercel env pull`. Variables (§6.3) are shared, so they don't need a copy.

3. **Development demo content** (optional, [§8.0](#80-content-in-sanity)): every deploy of `develop` adds
   the new demo content to the `development` dataset. It needs a Sanity token:
   <https://www.sanity.io/manage> → your project → **API** → **Tokens** → **Add API token** →
   name `github-seed-development`, permissions **Editor** → **Save** → copy it. Then **New repository
   secret** (Actions only, Dependabot PRs never seed): `SANITY_TOKEN` = that token.

   The token can write the whole project (Sanity tokens are per project, not per dataset), so two
   guards keep it on development: the workflow pins `SANITY_STUDIO_DATASET=development`, and the seed
   script refuses every other dataset. Only the seed step receives the token.

### 6.3 The variables (seven)

Same page → **Variables** tab → **New repository variable**, once per row:

| Name                       | Value |
| -------------------------- | ----- |
| `VERCEL_ORG_ID`            | N2    |
| `VERCEL_WEBAPP_PROJECT_ID` | N3    |
| `VERCEL_STUDIO_PROJECT_ID` | N4    |
| `PRODUCTION_WEBAPP_URL`    | N5    |
| `PRODUCTION_STUDIO_URL`    | N6    |
| `DEVELOPMENT_WEBAPP_URL`   | N7    |
| `DEVELOPMENT_STUDIO_URL`   | N8    |

Rules:

- URLs are the **exact final URLs**: `https://` + host, no path, no trailing slash, no redirect hop
  (apex → www, http → https). The smoke test fails on any redirect.
- IDs and URLs are **variables**, not secrets: they aren't sensitive, and secrets make logs unreadable (`***`).
- **No Sanity value lives in GitHub.** The pipeline pulls them from Vercel.
- GitHub Free has no environment-scoped secrets: everything is repository-level, and the workflows
  pick development or production values themselves. Feature addresses are computed, not stored.

### 6.4 Dependabot (optional but recommended)

`.github/dependabot.yml` already opens weekly update PRs against `develop` (they need the Dependabot
copy of `VERCEL_TOKEN`, [§6.2](#62-the-secret-one-value-stored-twice)). To also get security
alerts: **Settings → Code security** → enable **Dependabot alerts** and **Dependabot security updates**.

### 6.5 Branches

`main` exists. **Don't create `develop` yet**: creating it triggers the first deployment
([Part 8](#part-8-first-development-deployment)).

On GitHub Free (private repo) you can't enforce branch protection. The team rules are in
[Part 14](#part-14-golden-rules); CI also rejects PRs into `main` that don't come from `develop` or `hotfix/*`.

---

## Part 7: Your laptop (local development)

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
nvm use 24                           # Node 24, as in .nvmrc
npm install --global pnpm            # once per machine; pnpm then uses the version pinned in package.json
pnpm install                         # installs the web app and the studio workspace

cp .env.example .env                 # NUXT_PUBLIC_* (dataset: development)
cp studio/.env.example studio/.env   # SANITY_STUDIO_* (dataset: development)
```

Open both `.env` files and set the project ID to N1. Then:

```bash
cd studio && pnpm exec sanity login && cd ..   # once: opens the browser to log into Sanity
pnpm dev                              # web → http://localhost:3000 · studio → http://localhost:3333
```

Check: <http://localhost:3000> shows the home page (placeholder text until an editor publishes it), <http://localhost:3333> asks you
to log in, then shows the content tree.

Alternative to copying `.env` files: `pnpm dlx vercel@61.0.0 link` then
`pnpm dlx vercel@61.0.0 env pull .env --environment=development` (and the same inside `studio/`).

> Never point your laptop at `production`. `.env` files are git-ignored: never commit them.

---

## Part 8: First development deployment

### 8.0 Content in Sanity

`production` starts empty and stays editor-only: no sample content. `development` can get the demo
content in one command (repo root, after `cd studio && pnpm exec sanity login && cd ..`):

```bash
pnpm studio:seed --dry-run   # what it would write
pnpm studio:seed             # writes the demo content of studio/seed/
```

**Automatically:** every deploy of `develop` runs `pnpm studio:seed` (needs the
`SANITY_TOKEN` secret, [§6.2](#62-the-secret-one-value-stored-twice)). A schema change that ships with its demo
content is therefore visible on Development right after the deploy, without anyone running a command.

Re-running is safe: every demo document has a fixed id. The modes are described in
[`docs/sanity/SANITY.md`](../sanity/SANITY.md#the-seed-development-only); the script refuses every dataset but `development`.

Without the seed, every page exists because the code defines
it: while its document isn't published it renders empty and is hidden from search engines
(`noindex`, not in the sitemap), so the site and the smoke test work with an empty CMS. Editors fill
the pages in the Studio (**Pages → Home → Deutsch** opens or creates it) and **Publish**.
Before going live in production, publish at least the **Business profile**, the **Imprint** and
the **Privacy policy** (legally required).

### 8.1 Trigger it

Create `develop` from `main`. On GitHub: branch dropdown → type `develop` → **Create branch develop from main**.
Or from your laptop:

```bash
git push origin main:develop
```

That push starts **Actions → Deploy** (`https://github.com/<owner>/<repo>/actions/workflows/deploy.yml`). Watch it:

1. **CI** (about 5–8 min): lint, format, types, unit tests, Sanity type drift, build both apps, E2E tests.
2. **Deploy webapp** then **Deploy studio**, one at a time (a free Vercel plan builds one
   deployment at a time, so a second one would just queue): `vercel pull` (settings + Preview env of `develop`) →
   `vercel build` → `vercel deploy --prebuilt` → wait for the build → `vercel alias set`.
3. **Smoke test (development):** the Studio must answer `200` with the Studio page; the Web App must
   render correctly with no console errors.

### 8.2 How the development URL is created

There is **nothing to create in a dashboard**. The pipeline does it:

```
vercel deploy --prebuilt
   └─▶ https://landing-page-skeleton-webapp-8f3k2la1x-myteam.vercel.app   (new random URL every deploy)

vercel alias set <random URL> landing-page-skeleton-webapp-develop.vercel.app
   └─▶ the fixed name now points to this newest deployment
       (first run: the alias is created; next runs: it is moved)
```

- The alias name comes from the GitHub variable `DEVELOPMENT_*_URL`. Whoever deploys first owns a
  `*.vercel.app` name; if it's taken, `vercel alias set` fails: pick another name and update the
  **four places** that must match:
  1. GitHub variable `DEVELOPMENT_WEBAPP_URL` / `DEVELOPMENT_STUDIO_URL`
  2. Vercel Web App env `NUXT_PUBLIC_SITE_URL` (Preview, branch `develop`)
  3. Sanity CORS origins
  4. Your notebook (N7 / N8)
- To see it: Vercel project → **Deployments** → the newest deployment → **Domains** lists the alias.
  Aliases don't appear under Settings → Domains.
- Previous deployments keep their random URLs (handy to compare versions or roll back Development).
- **Feature works the same way, per pull request:** `ci.yml` points `<project-name>-pr-<number>.vercel.app`
  to the PR's newest deployment, and `feature-cleanup.yml` removes the address and the PR's
  deployments when the PR is merged or closed.
- **Production works differently:** `vercel deploy --prod` automatically gives the deployment the
  project's production domains (Settings → Domains). No alias step.

### 8.3 Check that everything works

- [ ] The Deploy run is green, and its **Summary** lists both public URLs.
- [ ] N7 opens the site **without any Vercel login**, with the content editors published; the language switcher works (e.g. `/kontakt` ↔ `/en/contact`).
- [ ] N8 opens the Studio and asks for a **Sanity** login (not Vercel); after login you see the content.
- [ ] In the Studio, edit a text and **Publish**. Reload N7: the change appears within about a minute (CDN).
- [ ] `N7/robots.txt` disallows everything (Development is never indexed).
- [ ] Vercel → each project → **Deployments**: only CLI deployments, none created by the Git integration
      (except the one failed deployment from the import in [§3.1](#31-import-the-repository) / [§4.1](#41-import-the-repository-again)).

---

## Part 9: First production release

A release ships what is on `develop` and not yet on `main`. Right after Part 8, both branches point
to the **same commit**, so there is nothing to release yet (GitHub's compare page says _"There isn't
anything to compare"_). Land **one change on `develop` first**, through the normal flow
([Part 10](#part-10-daily-workflow)): for example a PR that adds the live URLs to `README.md`. Check it on Development, then:

1. Open a PR **`develop` → `main`**:
   `https://github.com/<owner>/<repo>/compare/main...develop` → **Create pull request**.
2. Wait for **CI** to be green (the branch-policy check allows only `develop` or `hotfix/*` into `main`).
3. Merge with **Create a merge commit** (never squash a release: it would break the next release PR).
   With the CLI: `gh pr merge <PR> --merge`.
4. **Actions → Deploy** runs again: CI → deploy both apps with `--prod` → **Smoke test (production)**.
5. Check:
   - [ ] N5 shows the site, N6 the Studio login.
   - [ ] **Production content is empty at first**: editors fill it in the production Studio, or copy the published development content once (inside `studio/`):

     ```bash
     pnpm exec sanity dataset export development development.tar.gz --no-drafts
     pnpm exec sanity dataset import development.tar.gz production --replace   # ⚠️ overwrites documents with the same IDs
     ```

   - [ ] `N5/robots.txt` allows indexing and points to `N5/sitemap.xml`.
   - [ ] [docs/legal/go-live-checklist.md](../legal/go-live-checklist.md) was completed for the client
         before step 1 (imprint, checked privacy text, GTM containers, consent tests).

🎉 Setup done. From now on, everything below is routine.

---

## Part 10: Daily workflow

| You want to…            | Do                                                                                                                      | Result                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Build a feature         | Branch `feat/<name>` from `develop` → PR into `develop` (live at `-pr-<number>`) → CI green + review → **squash merge** | Development deploys automatically |
| Release to production   | PR `develop` → `main` → CI green → **merge commit**                                                                     | Production deploys automatically  |
| Fix production urgently | [§12.2](#122-hotfix)                                                                                                    |                                   |
| Change content          | In the Studio (Development Studio for tests, production Studio for real content). No deploy needed.                     | Live within about a minute        |
| Change the schema       | The checklist in [`docs/sanity/SANITY.md`](../sanity/SANITY.md). CI fails if you forget the types.                      | Deployed with the next release    |

Before opening or updating a PR, run the same checks as CI:

```bash
pnpm verify                          # lint · format · types · unit tests + coverage
pnpm build:e2e && CI=1 pnpm test:e2e  # E2E against a production build (fixture CMS)
```

---

## Part 11: Reference

### 11.1 Environment variable contract

**Every environment has the same keys; only the values differ:** Production, Development
(Preview · `develop`), Feature (Preview) and Local (Vercel Development), on both projects.

**Vercel project `webapp`** (Settings → Environment Variables, Sensitive OFF; targets in [§3.2](#32-environment-variables))

| Name                              | Production         | Development (Preview · `develop`)           | Feature (Preview)                           | Local (Development)                         | Value        |
| --------------------------------- | ------------------ | ------------------------------------------- | ------------------------------------------- | ------------------------------------------- | ------------ |
| `NUXT_PUBLIC_SANITY_PROJECT_ID`   | N1                 | N1                                          | N1                                          | N1                                          | ✅           |
| `NUXT_PUBLIC_SANITY_DATASET`      | `production`       | `development`                               | `development`                               | `development`                               | ✅           |
| `NUXT_PUBLIC_SITE_URL`            | N5                 | N7                                          | replaced by `-pr-<number>`                  | `http://localhost:3000`                     | ✅           |
| `NUXT_SITE_ENV`                   | `production`       | `development`                               | `feature`                                   | `local`                                     | ✅           |
| `NUXT_PUBLIC_SITE_NAME`           | site name          | same                                        | same                                        | same                                        | may be empty |
| `NUXT_PUBLIC_CONTACT_FORM_ACTION` | form endpoint      | a test form (never the production endpoint) | a test form (never the production endpoint) | a test form (never the production endpoint) | may be empty |
| `NUXT_PUBLIC_GTM_ID`              | production `GTM-…` | development `GTM-…`                         | development `GTM-…`                         | development `GTM-…`                         | may be empty |

Every key is present everywhere; "may be empty" is about the value only. `NUXT_PUBLIC_GTM_ID` stays **empty** in the `.env` you copy from `.env.example` (a `vercel env pull` brings the development container of Local)
and in CI builds. The E2E suite sets a fake container (`GTM-E2ETEST`, `tests/e2e/sanity/fixtureCms.ts`)
and stubs its script: the test runs never reach Google. Setup and verification: [docs/analytics/GTM.md](../analytics/GTM.md);
legal steps before production: [docs/legal/go-live-checklist.md](../legal/go-live-checklist.md).

**Vercel project `studio`**

| Name                       | Production   | Development (Preview · `develop`) | Feature (Preview) | Local (Development) | Value    |
| -------------------------- | ------------ | --------------------------------- | ----------------- | ------------------- | -------- |
| `SANITY_STUDIO_PROJECT_ID` | N1           | N1                                | N1                | N1                  | ✅       |
| `SANITY_STUDIO_DATASET`    | `production` | `development`                     | `development`     | `development`       | ✅       |
| `NUXT_SITE_ENV` ³          | `production` | `development`                     | `feature`         | `local`             | not read |

**GitHub** (repo → Settings → Secrets and variables → Actions)

| Kind     | Name                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secret   | `VERCEL_TOKEN` (Actions **and** Dependabot secrets), `SANITY_TOKEN` (Actions only, development seed), `PAGESPEED_API_KEY` (Actions, web performance) |
| Variable | `VERCEL_ORG_ID`, `VERCEL_WEBAPP_PROJECT_ID`, `VERCEL_STUDIO_PROJECT_ID`                                                                              |
| Variable | `DEVELOPMENT_WEBAPP_URL`, `DEVELOPMENT_STUDIO_URL`, `PRODUCTION_WEBAPP_URL`, `PRODUCTION_STUDIO_URL`                                                 |

**How they are used**

- Each framework uses its **native** convention: Nuxt maps `NUXT_PUBLIC_*` onto `runtimeConfig.public`;
  Sanity exposes `SANITY_STUDIO_*` to the Studio bundle.
- Both builds **fail fast** when a required variable is missing or invalid: `nuxt.config.ts`
  (`REQUIRED_BUILD_ENV`) and `studio/sanity.cli.ts` (`ENV_RULES`). There is no silent fallback to `production`.
- `apiVersion` is **not** an env var: it is fixed in `constants/sanity.constants.ts` because it changes GROQ behaviour (code).
- CI builds against the **Feature** values (Preview, all branches), pulled from Vercel with `vercel env pull`.

### 11.2 Pipeline files

| File                                    | Trigger                          | What it does                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.github/actions/setup/action.yml`      | used by every job                | pnpm pinned in `package.json`, Node from `.nvmrc`, cached `pnpm install --frozen-lockfile`, optionally the **pinned** Vercel CLI                                                                                                                                                                                                                                                                                               |
| `.github/workflows/ci.yml`              | every PR; called by `deploy.yml` | **Branch policy** (PRs to `main` only from `develop`/`hotfix/*`) · lint · format · Sanity type drift · types · unit tests (coverage ≥ 80 %) · build both apps · E2E · then (pull requests), only if all of these pass, **Deploy feature** (the branch to Vercel Preview, alias `-pr-<number>`) → **Web performance** (Google PageSpeed Insights) on that deployment against `webPerformance.config.ts` → **PR report** comment |
| `.github/workflows/deploy.yml`          | push to `develop` / `main`       | Full `ci.yml` again, then for **webapp + studio**, one at a time: `vercel pull` → `vercel build` → `vercel deploy --prebuilt` → `vercel inspect --wait` → (development) `vercel alias set` → **smoke test**; (development) **seed**: `pnpm studio:seed` (add only)                                                                                                                                                             |
| `.github/workflows/feature-cleanup.yml` | PR merged or closed              | Removes the PR's address `-pr-<number>` and its deployments (Vercel meta `pr=<number>`), marks its GitHub deployments inactive                                                                                                                                                                                                                                                                                                 |
| `.github/dependabot.yml`                | weekly                           | pnpm and GitHub Actions updates, PRs into `develop`                                                                                                                                                                                                                                                                                                                                                                            |
| `vercel.json`, `studio/vercel.json`     | read by Vercel                   | Build commands, Git auto-deploy **off**, Studio SPA rewrite                                                                                                                                                                                                                                                                                                                                                                    |

The **Deploy feature** job (pull requests only, after the tests) pulls the **Feature** variables
with the Vercel CLI (Preview rows for all branches: development dataset, `NUXT_SITE_ENV=feature`),
sets `NUXT_PUBLIC_SITE_URL` to the PR's own address `https://<project-name>-pr-<number>.vercel.app`,
builds, deploys the branch with the same variables at run time (tagged `pr=<number>`), and points
that address to it. Each PR has its own address, so open PRs never replace each other; a new push
to a PR cancels its older run. Then the **Web performance** job asks
**Google PageSpeed Insights** (its API: Google's servers, the same measurement as
pagespeed.web.dev) to audit **that real deployment**, each page template once, mobile and desktop:
every page in German (the default language; English renders the same templates) and one example
per slug template (one offer, one article). Vercel's CDN, compression and image optimisation are
included, nothing is measured from a laptop or localhost. It audits this commit's deployment URL,
so a later push cannot change the result. Feature sites are noindex (`NUXT_SITE_ENV=feature`, and Vercel marks previews), so their
SEO score is computed without "page is crawlable"; every other audit counts. After a merge,
`deploy.yml` runs the same budget on Development (`-develop`). Reports are artifacts
(`web-performance`), and the **PR report** comment shows the table with the PR's address.

**PageSpeed Insights API key** (one time, free): Google Cloud Console → a project → **APIs &
Services → Library** → enable **PageSpeed Insights API** → **Credentials → Create credentials →
API key** (restrict it to the PageSpeed Insights API) → GitHub → repo → Settings → Secrets and
variables → Actions → secret **`PAGESPEED_API_KEY`**. Without it Google answers 429.

**Budget**: every page aims for 90+ in every category and performance metric; a score under 80
fails the job. Each page is measured once on mobile and once on desktop. Google measures on
machines of different speeds (the same home page: 98 on a fast one, 84 on a slow one): a run on a
machine under benchmark index 600 is made again, up to 3 times, and the summary says how many
were. Scores from 80 to 89 pass and show as 🟡 "below target" in the PR report. Numbers:
`webPerformance.config.ts`; rules: `docs/conventions/CODING_STANDARDS.md` §7.1.

Public repository: GitHub Actions minutes on standard runners are free.

To make a red check block the merge button, require it on `develop` and `main`
(public repository: available on GitHub Free): **Settings → Branches → Add branch ruleset**
→ target `develop` and `main` → **Require status checks to pass** → add `Lint · Format · Types · Unit`,
`Build · E2E` and `Web performance`.

Why CI runs again after a merge: without branch protection anyone could push directly, and the
merged commit is not always the commit that was tested in the PR.

Design rules: Node 24 from `.nvmrc`; `HUSKY=0` in CI; actions pinned by commit SHA;
`permissions: contents: read`; Development and Production deploys **never cancel a running deploy** (if several pushes arrive meanwhile, only the newest waiting one deploys next);
Vercel CLI version pinned in the setup action (bump it on purpose, Dependabot doesn't track it).

### 11.3 What the smoke test proves

**Why a smoke test if E2E already passed?** They test different things:

|                   | E2E (in CI, before deploy)                             | Smoke test (after deploy)                                                                                                               |
| ----------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Question answered | "Is the **code** correct?"                             | "Is the **live site** working for real visitors?"                                                                                       |
| Runs against      | A build started **inside the CI runner** (`localhost`) | The **public URL** on Vercel                                                                                                            |
| Configuration     | Feature env pulled from Vercel, Node server            | The real Vercel deployment, domain, alias and protection                                                                                |
| Catches           | Bugs in pages, i18n, SEO tags, components              | Wrong env vars for that environment, alias not moved, Vercel login wall, wrong root directory, failed domain, serverless runtime errors |
| Size              | Full suite (every page and behaviour)                  | Tiny: each route loads and our app rendered (about 30 s)                                                                                |

A green E2E run proves the commit is good; it can't see the hosting. The smoke test is the only
check that looks at what users actually get, and it's also the only check that runs for
**production** with production settings. Example: the code passed every E2E test, yet the
pre-production site answered `302` to a Vercel login page for everyone. Only the smoke test caught it.

"No errors" is not enough: an auth wall or an SSO login page also answers 200.

- **Studio** (`deploy.yml`): HTTP `200` **without following redirects**, and the page contains the
  Studio mount point `id="sanity"`.
- **Web App** (`tests/e2e/smoke.spec.ts`, run with `PLAYWRIGHT_BASE_URL`): the final URL stays on
  the target host, the document answers exactly `200`, our app rendered (`<html lang>`, labelled
  main navigation, no error page), with no console errors, Vue warnings or hydration mismatches.

### 11.4 Sanity operations

| Task                                | Command (inside `studio/`, after `pnpm exec sanity login`)                                                                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Refresh development from production | `pnpm exec sanity dataset export production prod.tar.gz --no-drafts`, then `pnpm exec sanity dataset import prod.tar.gz development --replace`                                                                                   |
| Fill development with demo content  | `pnpm studio:seed` (repo root, [§8.0](#80-content-in-sanity)). After a refresh from production, the next seed (every Development deploy) fills the copied pages' empty fields with demo text, and `--reset` would overwrite them |
| List datasets                       | `pnpm exec sanity dataset list`                                                                                                                                                                                                  |
| Export a backup                     | `pnpm exec sanity dataset export production backup.tar.gz`                                                                                                                                                                       |

**Sitemap freshness.** Published pages, offers and articles enter `/sitemap.xml` at build time, so they are
listed after the next deploy. If Sanity can't be reached during the build, the build **fails** rather
than ship a sitemap without the CMS pages: re-run it. To redeploy on every publish (optional, once per environment):

1. GitHub → your avatar → **Settings → Developer settings → Fine-grained tokens → Generate new token**:
   only this repository, permission **Actions: Read and write**. Copy the token.
2. `https://www.sanity.io/manage` → project → **API → Webhooks → Create webhook**:
   - URL: `https://api.github.com/repos/<owner>/<repo>/actions/workflows/deploy.yml/dispatches`
   - Dataset: `development` (or `production`) · Trigger on: **Create, Update, Delete**
   - Filter: `_type in ["offer", "post"] || _id in path("*Page-*")` · Projection: `{"ref": "develop"}` (`"main"` for production)
   - HTTP method: **POST** · HTTP headers: `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`
3. Publish a page: **Actions → Deploy** starts for that branch (the same pipeline as a push).

The Studio is hosted on **Vercel only**. Never run `sanity deploy` (it would publish a second,
unmanaged Studio on `*.sanity.studio`).

---

## Part 12: Runbooks

### 12.1 Where is my deploy?

GitHub → **Actions** → **Deploy** → the run → **Summary**: public URL and unique deployment URL of each app.

### 12.2 Hotfix

1. Branch `hotfix/<name>` **from `main`** → fix → PR into `main` → CI green → **merge commit**.
2. Production deploys automatically.
3. **Back-merge:** PR `main` → `develop`, **merge commit** (never squash), so Development doesn't
   regress and the next release doesn't conflict.

### 12.3 Roll back production

1. Vercel → project → **Deployments** → the last good **Production** deployment → **⋯** →
   **Instant Rollback** ([docs](https://vercel.com/docs/instant-rollback)). Do it for **both**
   projects if the release touched both.
2. Fix forward with a hotfix ([§12.2](#122-hotfix)).
3. ⚠️ After a rollback, Vercel stops auto-assigning production domains until a deployment is
   **promoted** again: if the next `--prod` deploy doesn't go live, Deployments → that deployment
   → **⋯ → Promote**.

Content mistakes don't need a rollback: in the Studio, open the document → **History** → restore a previous version.

### 12.4 Use a custom domain (e.g. `www.example.com`)

Change these **five** things together:

1. Vercel webapp → **Settings → Domains → Add** `www.example.com` → create the DNS record Vercel
   shows at your registrar ([docs](https://vercel.com/docs/domains/working-with-domains/add-a-domain)).
   Make it the primary domain and redirect the apex (`example.com`) to it.
2. Vercel env `NUXT_PUBLIC_SITE_URL` (Production) = `https://www.example.com`.
3. GitHub variable `PRODUCTION_WEBAPP_URL` = `https://www.example.com` (the **final** host, after redirects).
4. Sanity CORS: add `https://www.example.com` (no credentials).
5. Rebuild production so the new canonical URL and sitemap are baked in: GitHub → **Actions → Deploy**
   → the latest run on `main` → **Re-run all jobs** (it pulls the new env from Vercel). No release needed.

Same idea for the Studio (`studio.example.com`, with credentials in CORS).

### 12.5 Rotate the Vercel token

Create a new token ([§5.1](#51-create-the-deploy-token)) → update **both** GitHub secrets named `VERCEL_TOKEN` (Actions and Dependabot, [§6.2](#62-the-secret-one-value-stored-twice))
→ re-run the last Deploy run → delete the old token in Vercel.

The Sanity seed token (`SANITY_TOKEN`) the same way: new token in Sanity ([§6.2](#62-the-secret-one-value-stored-twice), step 3) →
update the GitHub secret → delete the old token in Sanity.

### 12.6 Add an environment variable

All in one PR:

1. Add it to `.env.example` or `studio/.env.example`, with a comment.
2. Add it to the table in [§11.1](#111-environment-variable-contract).
3. Add it in Vercel for **every** environment: Production, Preview for `develop` (Development), Preview for all branches (Feature) and Development (Local).
4. If the build can't work without it, add it to `REQUIRED_BUILD_ENV` (`nuxt.config.ts`) or
   `ENV_RULES` (`studio/sanity.cli.ts`).

### 12.7 Add or remove an editor

Sanity → project → **Members** ([§2.5](#25-invite-the-editors)). No deploy needed.

### 12.8 CI fails with `ERR_PNPM_OUTDATED_LOCKFILE`

CI installs with `pnpm install --frozen-lockfile`: a `package.json` (root or `studio/`) or
`pnpm-workspace.yaml` changed without `pnpm-lock.yaml`. Run `pnpm install` and commit the lockfile.
It is the same on every OS (pnpm records the optional packages of all platforms), so it can be
regenerated on Windows, macOS or Linux.

A dependency that needs an install script (native binary, postinstall) must be allowed in
`allowBuilds` in `pnpm-workspace.yaml`; pnpm skips the scripts of every other package.

---

## Part 13: Troubleshooting

| Symptom (where)                                                                                                  | Cause                                                                                                             | Fix                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Smoke: `… answered HTTP 302 (auth wall, redirect or unreachable?)` and the URL redirects to `vercel.com/sso-api` | Vercel Authentication is on (default for Preview = Development and Feature)                                       | [§3.4](#34-deployment-protection-switch-it-off-) / [§4.4](#44-deployment-protection-off-) on **both** projects, then re-run the failed jobs                                                                                             |
| Smoke: `answered HTTP 301/308`                                                                                   | `*_URL` variable isn't the final URL (http vs https, apex vs www, trailing path)                                  | Set the exact final URL ([§6.3](#63-the-variables-seven))                                                                                                                                                                               |
| Smoke: `answered HTTP 000`                                                                                       | Host doesn't exist / DNS / typo in the variable                                                                   | Check the variable; for Development, check the alias step succeeded                                                                                                                                                                     |
| Smoke: `did not serve the Sanity Studio`                                                                         | Studio project builds the wrong folder                                                                            | Root Directory must be `studio` ([§4.1](#41-import-the-repository-again))                                                                                                                                                               |
| Deploy feature: `… is longer than 63 characters`                                                                 | `<project-name>-pr-<number>` exceeds the host-name limit                                                          | Shorten the Vercel web app project name                                                                                                                                                                                                 |
| Build: `Missing required env: NUXT_…`                                                                            | Variable missing in Vercel for that environment, or Sensitive ON                                                  | [§3.2](#32-environment-variables)                                                                                                                                                                                                       |
| Build: `[studio] Missing or invalid env: SANITY_STUDIO_…`                                                        | Same, Studio project                                                                                              | [§4.2](#42-environment-variables)                                                                                                                                                                                                       |
| `vercel pull`: `Project not found` / `not authorized`                                                            | Wrong `VERCEL_ORG_ID` / project ID, or the token's scope isn't that team                                          | [§5](#part-5-vercel-token-and-ids-for-github), [§6.3](#63-the-variables-seven)                                                                                                                                                          |
| `vercel alias set` fails (name taken / not authorized)                                                           | The development name belongs to someone else                                                                      | Pick a new name, update the four places in [§8.2](#82-how-the-development-url-is-created)                                                                                                                                               |
| Deploy: **Wait for the build** times out after 10 min                                                            | The deployment never left `BUILDING`: queued behind another build, or Vercel failed to ingest the prebuilt output | Read the build logs the step prints, or open the **Inspect** URL from the **Deploy prebuilt output** step. Queued: wait for the other build to finish and re-run. Failed: fix the cause, the step already discarded the dead deployment |
| Build: `Error … fetching` from the sitemap (`nitro:config`)                                                      | Sanity unreachable or wrong project/dataset while building the sitemap                                            | Check the env vars and Sanity status, then re-run the job                                                                                                                                                                               |
| CI: `types/sanity.types.ts is stale`                                                                             | Schema or query changed without TypeGen                                                                           | `pnpm typegen`, commit the file                                                                                                                                                                                                         |
| CI: `PRs into main must come from 'develop' or 'hotfix/*'`                                                       | PR from a feature branch straight into `main`                                                                     | Target `develop` instead                                                                                                                                                                                                                |
| Browser console: `blocked by CORS policy` on `*.api.sanity.io`                                                   | Origin missing in Sanity CORS                                                                                     | [§2.3](#23-cors-origins-who-may-call-sanity-from-a-browser)                                                                                                                                                                             |
| Studio login loops or "not authorized"                                                                           | Studio origin lacks **Allow credentials**, or the user isn't a project member                                     | [§2.3](#23-cors-origins-who-may-call-sanity-from-a-browser), [§2.5](#25-invite-the-editors)                                                                                                                                             |
| Site loads but pages are empty                                                                                   | Dataset is empty, or not public                                                                                   | Publish content in that dataset's Studio; dataset visibility **Public**                                                                                                                                                                 |
| Content change not visible                                                                                       | Not **published** (drafts are private), or the CDN still caches it                                                | Publish; wait about a minute                                                                                                                                                                                                            |
| A deployment by `vercel[bot]` appears on push                                                                    | `git.deploymentEnabled: false` was removed from `vercel.json`                                                     | Restore it: Actions must stay the only deployer                                                                                                                                                                                         |
| Next `--prod` deploy doesn't go live after a rollback                                                            | Vercel paused auto-assignment                                                                                     | Promote the deployment ([§12.3](#123-roll-back-production))                                                                                                                                                                             |

Re-run only the failed jobs: Actions → the run → **Re-run jobs → Re-run failed jobs**
(or `gh run rerun <run-id> --failed`).

---

## Part 14: Golden rules

1. **Never** force-push `main` or `develop`.
2. **Never** deploy from your laptop (`vercel --prod`, `sanity deploy`). Only the pipeline deploys.
3. **Never** skip or soften a failing smoke test: fix the cause.
4. **Never** develop against the `production` dataset, and never commit `.env` files.
5. **Never** add a wildcard CORS origin with credentials (the one Feature pattern has none), or a Sanity token to the web app.
6. **Three** secrets in GitHub: `VERCEL_TOKEN` (Actions and Dependabot), `SANITY_TOKEN` (development seed only) and `PAGESPEED_API_KEY` (web performance); app configuration lives **only** in Vercel.
7. **Never** seed production: it is filled by editors only.
8. Code and this document change **together**, in the same PR.
