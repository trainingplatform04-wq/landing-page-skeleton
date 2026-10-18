# ADR 0004: Skeleton scope and data flow

- **Status**: Accepted (2026-10-06, last updated 2026-10-17 to match the code).

## Scope

- **Code owns the pages, Sanity owns their content.** A page exists because the code defines it (a route, a schema, a composable); editors fill in fields and never assemble a page. No page builder.
- **Core pages** every project keeps: home, contact (with the form), imprint and privacy (required by German law).
- **Example pages** that show one pattern each: offers and offer (a collection with a slug), magazine and article (a dated, filterable collection, [ADR 0006](0006-magazine.md)), About, FAQ. `docs/SKELETON.md` says what each one teaches and how to remove it.
- **Demo content on development only**: `pnpm studio:seed` fills `development` with every page in every language; `production` starts empty and editors write it. Every schema change updates the seed in the same PR.

## Data flow

- **One door to the CMS**: `useCmsQuery` (`composables/useCmsQuery/`) runs a query in the visitor's language once on the server, validates the answer and answers 503 on a CMS error. ESLint forbids the Sanity client anywhere else in `composables/`.
- **Queries are groqd** (a TypeScript builder checked against the schema types from `pnpm typegen`, answers validated with zod), each in a `<page>.query.ts` next to its composable; shared fragments in `utils/groqd/groqd.utils.ts`.
- **A page composable maps the answer to a view**: plain values (`types/content.types.ts`), links resolved, dates and prices formatted. Components never see CMS types.
- **`await` in `<script setup>`**: the server answers complete HTML with the right status (404 for an unknown slug, 503 on a CMS error).

## Why groqd

Queries are type-checked while writing and their answers validated at runtime, and a query reads as TypeScript. The cost: a second API next to GROQ, and a published document that lacks a field the query requires answers 503 (so optional fields are declared `.nullable(true)`).
