import process from 'node:process'
import { cloudflare } from '@cloudflare/vite-plugin'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const state = process.env.BUFFALO311_MIGRATION_STATE
const target = process.env.BUFFALO311_ENV
const deployed = target === 'demo' || target === 'staging'
// These identifiers are public and are included in the browser bundle.
const sentryDsn = process.env.VITE_SENTRY_DSN ?? (deployed ? 'https://f095985424404c739303ed94e194280f@o285360.ingest.us.sentry.io/1780563' : '')
const fathomSiteId = process.env.VITE_FATHOM_SITE_ID ?? (target === 'demo' ? 'SUTFZPOU' : '')
const { SENTRY_AUTH_TOKEN: authToken, SENTRY_ORG: org, SENTRY_PROJECT: project } =
  loadEnv('sentry-build-plugin', process.cwd(), 'SENTRY_')

export default defineConfig({
  resolve: { tsconfigPaths: true },
  define: {
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(sentryDsn),
    'import.meta.env.VITE_FATHOM_SITE_ID': JSON.stringify(fathomSiteId),
    'import.meta.env.VITE_BUFFALO311_ENV': JSON.stringify(deployed ? target : 'development'),
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      persistState: state ? { path: state } : undefined,
    }),
    ...(authToken && org && project ? [sentryTanstackStart({ authToken, org, project })] : []),
  ],
})
