import process from 'node:process'
import { bindings, defineConfig } from 'cf/config'

export default defineConfig(() => {
  const mode = process.env.BUFFALO311_ENV
  const staging = mode === 'staging'
  const production = mode === 'production'
  const prefix = production ? 'BUFFALO311_PRODUCTION' : 'BUFFALO311_STAGING'
  const deployed = staging || production
  const database = deployed ? process.env[`${prefix}_DATABASE_ID`] : '62edd46c-09f0-411b-8ff5-736d62534ef6'
  const bucket = deployed ? process.env[`${prefix}_BUCKET`] : 'buffalo311-local'
  if (!database || !bucket) {
    throw new Error(`Set ${prefix}_DATABASE_ID and ${prefix}_BUCKET.`)
  }
  if (production && !process.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
    throw new Error('Production requires a Clerk production publishable key.')
  }

  return {
    worker: {
      name: production ? 'buffalo311' : staging ? 'buffalo311-staging' : 'buffalo311-local',
      ...(production ? { workersDev: false, previewUrls: false } : {}),
      compatibilityDate: '2026-11-23',
      compatibilityFlags: ['nodejs_compat'],
      observability: { enabled: true, redactQueryString: true, traces: { enabled: true } },
      entrypoint: '@tanstack/react-start/server-entry',
      env: {
        CLERK_SECRET_KEY: bindings.secret(),
        DB: bindings.d1({ id: database }),
        PHOTOS: bindings.r2({ name: bucket }),
      },
    },
  }
})
