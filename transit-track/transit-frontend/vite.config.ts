import path from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' loads every variable in the .env files, not just VITE_* ones.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [svelte(), tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve('./src/lib'),
      },
    },
    // In development, forward /api/... to the owner's API (see .env.example).
    server: env.API_PROXY_TARGET
      ? {
          proxy: {
            '/api': {
              target: env.API_PROXY_TARGET,
              changeOrigin: true,
              rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
            },
          },
        }
      : undefined,
  }
})
