import process from 'node:process'
import { bindings, defineConfig } from 'cf/config'

export default defineConfig(() => {
  const staging = process.env.BUFFALO311_ENV === 'staging'
  const database = staging ? process.env.BUFFALO311_STAGING_DATABASE_ID : '62edd46c-09f0-411b-8ff5-736d62534ef6'
  const bucket = staging ? process.env.BUFFALO311_STAGING_BUCKET : 'buffalo311-local'
  if (!database || !bucket) {
    throw new Error('Set BUFFALO311_STAGING_DATABASE_ID and BUFFALO311_STAGING_BUCKET for staging.')
  }

  return {
    worker: {
      name: staging ? 'buffalo311-staging' : 'buffalo311-local',
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
