# Buffalo 311 on Cloudflare Workers

This migration uses TanStack Start, D1, R2, and Clerk. The deployed Next.js commit serving as the behavior baseline is `9721d11`. The existing v3 checkout is separate and still has work in progress.

## Run locally

Use pnpm. Set the selected Clerk development application's `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in an ignored `.env.local`. `VITE_MAPBOX_TOKEN` enables Mapbox tiles and Buffalo address autocomplete. Without it, the map uses OpenStreetMap and the form accepts manual address entry and map clicks. `VITE_MAPBOX_PERMANENT_GEOCODING=true` opts into Mapbox Permanent Geocoding for accounts configured to use it.

```sh
pnpm install --frozen-lockfile
pnpm exec cf d1 migrations apply 62edd46c-09f0-411b-8ff5-736d62534ef6 --local
pnpm exec cf d1 raw 62edd46c-09f0-411b-8ff5-736d62534ef6 --local --sql "$(cat fixtures/local.sql)"
pnpm dev -- --host 127.0.0.1 --port 43119
```

With the server running, run `pnpm test:migration` to check the report routes, guest permissions, email privacy, and R2 uploads. Run `pnpm migration:rehearse` to restore and verify a synthetic snapshot twice in isolated D1 and R2 state. `pnpm typecheck` checks the Worker binding and route types.

## Restore into staging

1. Set up a separate staging D1 database and private R2 bucket. Use a private working directory for the snapshot, since it includes report contact emails and historical profiles. Use a read-only Postgres connection and save the output of `psql -XqAt -v ON_ERROR_STOP=1 -f scripts/snapshot.sql` as `data.json` in that directory.
2. Download the public Supabase objects using `node scripts/download-public-media.mjs <snapshot-directory> https://<project>.supabase.co`. This copies both attached and unreferenced objects. The source bucket and paths are retained below the snapshot's `objects` directory.
3. Apply `migrations/` to the staging database using `cf d1 migrations apply <staging-database-id>`. Run `node scripts/restore.mjs <snapshot-directory> https://<project>.supabase.co <staging-database-id> <staging-bucket-name> --staging`. The restore checks record values, foreign keys, object sizes, and destination SHA-256 hashes, and writes a media manifest. Repeating the same restore preserves the imported IDs.
4. Set `BUFFALO311_STAGING_DATABASE_ID` and `BUFFALO311_STAGING_BUCKET` in the staging build environment. Configure the Worker secret and public Clerk key for that hostname. Scope the Mapbox browser token to the staging hostname. Restrict staging access before serving the real snapshot. Use `pnpm run deploy --dry-run --secrets-file <staging-secrets-file>` to check the build.
5. Verify sign-in, guest reporting with and without photos, comment attribution, standard-user access, admin status history, and owner or admin deletion. Historical profile IDs remain unlinked until an authorized operator explicitly maps a Clerk subject to the corresponding D1 profile. Grant admin explicitly to the designated staging account. No password or session import is required.

## Rehearsal results

The private local restore verified 427 records across six tables and all 348 storage objects. Six attached images carried a plain-text content type. The importer used their file signatures to restore image metadata. Fifteen historical reports have out-of-range latitudes. D1 preserves those values, and the report map skips those locations.

## Cutover

Use a fresh destination for the final restore so source deletions are reflected. Pause legacy writes, including direct Supabase writes, before taking the final snapshot. Preserve report URLs by using the same numeric IDs. New photo links use `/media/<image-id>`. Existing links hosted on Supabase still rely on that project, so keep it available during acceptance and update external links before retirement. Before rolling back after release, reconcile any writes made only on Workers.
