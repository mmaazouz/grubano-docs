# Docs auto-update pipeline

Owner: Agent 5.

This folder runs the auto-doc pipeline that keeps `docs.grubano.com` in sync with
the main `grubano-kitchen-hub` application repo.

## Pipeline overview

```
            push to grubano-kitchen-hub main
                       │
                       ▼
            repository_dispatch (event_type: app-updated)
                       │
                       ▼
       .github/workflows/auto-update.yml  (this repo)
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
  scripts/        scripts/         git commit + push
  generate-       translate-       to main → site
  from-source.js  content.js       redeploys
```

Trigger sources (all live in `auto-update.yml`):

| Trigger | When |
|---|---|
| `repository_dispatch: app-updated` | After every successful prod deploy of `grubano-kitchen-hub` |
| Cron `0 2 * * *` | Nightly safety net |
| Manual `workflow_dispatch` | From the Actions tab, for testing |

## scripts/

### `generate-from-source.js`

Reads a checkout of `grubano-kitchen-hub` (path supplied via `APP_REPO_PATH`)
and writes **English source** docs to:

- `content/en/api/*.mdx` — one MDX per top-level resource (e.g. `orders.mdx`
  covers `/api/orders/*`). Each endpoint shows methods, path, auth, detected
  query params, detected response status codes, and a description sourced from
  the route's JSDoc (or a placeholder).
- `content/en/changelog/index.mdx` — derived from the last 50 commits in the
  source repo, grouped by date and Conventional Commits type.
- `content/en/api/_meta.ts` and `content/en/changelog/_meta.ts` — sidebar.

Each generated file embeds a `sourceHash` in its frontmatter so the translator
can skip files that haven't changed.

**Deferred** (per the v2 brief): zod body-schema parsing,
`components/design-system` extraction, screenshot generation, interactive API
playground. Add these incrementally.

### `translate-content.js`

Reads `content/en/**/*.mdx` and translates each file to **fr / es / ar / it**
via the Claude API (`claude-sonnet-4-5` by default). Writes:

- `content/fr/api/*.mdx`, `content/fr/changelog/*.mdx`, etc. for each locale.
- A locale-appropriate `_meta.ts` per directory.

**Idempotent:** if the target file's frontmatter `sourceHash` already matches
the EN source, the API call is skipped. So re-running on unchanged source costs
nothing.

**Env:**

| Variable | Purpose | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Required | — |
| `ANTHROPIC_MODEL` | Override model | `claude-sonnet-4-5` |
| `TRANSLATE_CONCURRENCY` | Parallel API calls | `4` |
| `TRANSLATE_LANGS` | Comma-separated target locales | `fr,es,ar,it` |
| `TRANSLATE_DRY_RUN=1` | Print plan, no API calls | off |

### `generate-docs.js` (legacy)

The original Agent 5 v1 generator. Writes **French** docs directly to
`content/api/` and `content/changelog/`. Superseded by the EN-source +
translation pipeline above. Kept temporarily for backward compat with the
existing `/api/` URLs; safe to delete once the new locale URLs are linked from
navigation.

## npm scripts

```bash
# Generate EN source from a sibling kitchen-hub checkout
APP_REPO_PATH=../grubano-kitchen-hub npm run docs:generate

# Translate EN → fr/es/ar/it (requires ANTHROPIC_API_KEY)
npm run docs:translate

# Both at once
APP_REPO_PATH=../grubano-kitchen-hub npm run docs:auto

# Plan-only (no API calls)
TRANSLATE_DRY_RUN=1 npm run docs:translate
```

## Required GitHub secrets

Configure in **Settings → Secrets and variables → Actions** of this repo
(`mmaazouz/grubano-docs`):

| Secret | Required? | Purpose |
|---|---|---|
| `APP_REPO_TOKEN` | If `grubano-kitchen-hub` is private | Fine-grained PAT with **Contents: read** on `grubano-kitchen-hub` |
| `ANTHROPIC_API_KEY` | For translations | Claude API key. If missing, the workflow still runs but only EN is updated. |

The default `GITHUB_TOKEN` is used to push the regenerated docs back to `main`
of this repo (no additional secret needed for that step).

> [!NOTE]
> Pushes made with `GITHUB_TOKEN` do **not** trigger other workflows in this
> repo (GitHub's anti-loop safety). The deploy is expected to run via the
> hosting provider's repo watcher (Vercel today; o2switch FTP later via a
> separate workflow). If the deploy workflow lives in this repo and must fire
> on the auto-update commit, switch the push to use a PAT.

## See also

- `WEBHOOK-FOR-AGENT-1.md` — the snippet Agent 1 adds in `grubano-kitchen-hub`
  to fire the `repository_dispatch` event on every prod deploy.
