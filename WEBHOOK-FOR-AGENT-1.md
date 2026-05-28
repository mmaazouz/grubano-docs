# Webhook trigger for Agent 1 — docs auto-update

**Owner:** Agent 1 (DevOps — CI/CD). This snippet belongs in the main app repo
(`grubano-kitchen-hub`) and is **not** to be added by Agent 5.

## What it does

After a successful production deploy, it fires a `repository_dispatch` event
(`event_type: app-updated`) at the `grubano-docs` repo. That event triggers the
`auto-update.yml` workflow in `grubano-docs`, which regenerates the API reference
+ changelog and pushes them, so Vercel redeploys the docs automatically.

## Where to add it

In `.github/workflows/deploy-production.yml`, as the **last step** of the deploy
job (only runs once the deploy itself has succeeded).

## YAML snippet

```yaml
      - name: Trigger docs update
        if: success()
        run: |
          curl -fsSL -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${{ secrets.DOCS_DISPATCH_TOKEN }}" \
            -H "X-GitHub-Api-Version: 2022-06-28" \
            https://api.github.com/repos/mmaazouz/grubano-docs/dispatches \
            -d '{"event_type":"app-updated"}'
```

## Required secret

> [!IMPORTANT]
> The default `GITHUB_TOKEN` **cannot** trigger `repository_dispatch` in another
> repository. Create a fine-grained PAT (or classic PAT with `repo` scope) that
> can write to `mmaazouz/grubano-docs`, and store it in the **grubano-kitchen-hub**
> repo as the secret `DOCS_DISPATCH_TOKEN`.

Fine-grained PAT settings:
- Repository access: only `mmaazouz/grubano-docs`
- Permissions: **Contents: read & write** and **Metadata: read** (Contents
  write is what authorizes the dispatch)

## Verifying

After adding the step and the secret, run a production deploy. In the
`grubano-docs` repo's **Actions** tab you should see an `Auto-update docs` run
triggered by `repository_dispatch` within a minute of the deploy finishing.
