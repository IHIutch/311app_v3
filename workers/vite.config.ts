import process from 'node:process'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const state = process.env.BUFFALO311_MIGRATION_STATE

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart(),
    viteReact(),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      persistState: state ? { path: state } : undefined,
    }),
  ],
})
