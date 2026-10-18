# Sanity: how it works

The CMS is Sanity v6. The Studio (the editors' app) lives in `studio/`; the website reads published content only, with no token.

## The content model

| Kind            | Documents                                                                                                     | Language                                               | In the Studio                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| **Pages**       | `homePage`, `offersPage`, `magazinePage`, `aboutPage`, `faqPage`, `contactPage`, `imprintPage`, `privacyPage` | One per language, fixed id `<type>-<language>`         | **Pages → Home → Deutsch**: opened, never created or deleted |
| **Collections** | `offer` and `post` (have a URL), `category`, `author`, `testimonial`, `faqItem`                               | One language each, linked by the **Translations** menu | **Offers → Deutsch** lists and creates them                  |
| **Settings**    | `businessProfile` (no text), `siteSettings` (footer note)                                                     | One in total / one per language                        | At the bottom of the desk                                    |

Reusable objects: `accessibleImage` (picture + required alt text, crop and focal point), `cta` (a button: empty or label + link), `link` (a page, an offer or an `https:`/`mailto:`/`tel:` address), `closing` (the band that ends a page), `richText`, `articleBody`, `seo`.

## Where things are

| Path                                                   | What                                                                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `studio/schemas/{pages,collections,objects,settings}/` | One schema per file; registered in `studio/schemas/index.ts`                                                                              |
| `studio/schemas/fields.ts`                             | Shared fields: `languageField`, `titleField`, `slugField`, `referenceListField`, …                                                        |
| `studio/sanity.structure.ts`                           | The desk (left-hand menu)                                                                                                                 |
| `studio/utils/singleton/`                              | Language templates, singleton ids and actions                                                                                             |
| `studio/seed/`                                         | Development demo content: `seed.data.ts` (documents), `seed.copy.ts` and `seed.magazine.ts` (words), `seed.builders.ts`, `seed.images.ts` |
| `utils/groqd/groqd.utils.ts`                           | The query builder `q` and the shared fragments                                                                                            |
| `composables/<useName>/<name>.query.ts`                | One page's query                                                                                                                          |
| `composables/useCmsQuery/`                             | The only door to the CMS from the website                                                                                                 |
| `types/sanity.types.ts`                                | Generated schema types (`pnpm typegen`), never edited                                                                                     |

## Add or change a field (checklist, one PR)

1. The schema in `studio/schemas/`.
2. `pnpm typegen` (commit `types/sanity.types.ts`).
3. The query in `<name>.query.ts` (`.nullable(true)` if it can be empty).
4. The view type and the mapper in the composable; the component that shows it.
5. The demo value in every language in `studio/seed/` (`pnpm typecheck` fails on a missing required field).
6. The test documents in `tests/e2e/sanity/fixtures.ts` and the composable's spec.

## Queries

- groqd, at the top of a page's `<name>.query.ts`. A page document: `.filterByType('homePage').filterRaw('language == $locale').slice(0)`.
- Filter a list of references by language before following it: `.field('faq[]').filterRaw('@->language == $locale').deref()`.
- `null` is normal: weak references to deleted documents, empty fields, unpublished pages. Mappers handle it.
- `useCmsQuery(name, query, params)` sends `$locale`, caches per parameters and answers 503 on a CMS error.

## Environments and tokens

- Two datasets, both public (read without a token): `development` (local, CI, Feature and Development) and `production` (editors only).
- The website never uses a token. The only token is the development seed's (`SANITY_TOKEN`, GitHub secret, dataset pinned to `development`).
- Studio deployments go through the pipeline only (never `sanity deploy`).

## The seed (development only)

| Command                      | Effect                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm studio:seed`           | Creates missing documents and fills empty top-level fields. Changed values stay; an emptied field is filled again. Also run on every Development deploy |
| `pnpm studio:seed --reset`   | Development matches the seed: editors' changes on demo documents discarded, removed ones deleted (owner's go)                                           |
| `pnpm studio:seed --dry-run` | Prints the plan, writes nothing                                                                                                                         |

The seed refuses every dataset but `development`. Pictures are downloaded from their URLs and uploaded to the dataset; none are committed.

## Good to know

- A changed slug makes the old URL answer 404 (no redirects).
- A category's slug is the same in every language (the magazine filter `?category=`).
- A testimonial shows only with the client's recorded consent.
- There is no draft preview: Development is the preview.
- The sitemap is built from published content at deploy time.
