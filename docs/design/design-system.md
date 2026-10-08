# Design system and Lovable project

The registry the design track (`/design`) reads first. Agents use the `lovable` MCP server **only** for the project below.

## Lovable

| Item                   | Value                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Workspace              | Training's Lovable · `d594d1d442339de3be60`                                        |
| Project                | FitFlow Platform · `c69a43a6-c055-4de5-9929-e1aad1913e87`                          |
| Editor                 | https://lovable.dev/projects/c69a43a6-c055-4de5-9929-e1aad1913e87                  |
| Preview                | https://id-preview--c69a43a6-c055-4de5-9929-e1aad1913e87.lovable.app               |
| Bound on               | 2026-10-08 (existing project, created before the conventions)                      |
| Plan                   | Free (optimised)                                                                   |
| Git sync repository    | not linked yet                                                                     |
| Project knowledge from | 2026-10-08: conventions + FitFlow theme (brief 0001)                               |
| Conventions applied    | offers pages and header with brief 0001; home, FAQ, contact when their briefs come |

Changing the project is a change to this file, reviewed like any other.

## Tokens (source of truth: code)

The theme lives in `app.config.ts` (Nuxt UI colors) and `assets/css/main.css` (`@theme`). The Lovable project knowledge mirrors it (DESIGN_WORKFLOW §6.3) and is regenerated whenever those files change.

## Conventions every Lovable build follows

Written into the project knowledge, so prompts never repeat them: DESIGN_WORKFLOW §6.2.
