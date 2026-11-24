import process from 'node:process'
import { bindings, defineConfig } from 'cf/config'

export default defineConfig(() => {
  const mode = process.env.BUFFALO311_ENV
  const staging = mode === 'staging'
  const demo = mode === 'demo'
  const prefix = demo ? 'BUFFALO311_DEMO' : 'BUFFALO311_STAGING'
  const deployed = staging || demo
  const database = deployed ? process.env[`${prefix}_DATABASE_ID`] : '62edd46c-09f0-411b-8ff5-736d62534ef6'
  const bucket = deployed ? process.env[`${prefix}_BUCKET`] : 'buffalo311-local'
  if (!database || !bucket) {
    throw new Error(`Set ${prefix}_DATABASE_ID and ${prefix}_BUCKET.`)
  }
  return {
    worker: {
      name: demo ? 'buffalo311' : staging ? 'buffalo311-staging' : 'buffalo311-local',
      ...(deployed ? { workersDev: true, previewUrls: false } : {}),
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
