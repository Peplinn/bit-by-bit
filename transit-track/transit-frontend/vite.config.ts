import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // '' loads every variable in the .env files, not just VITE_* ones.
  const env = loadEnv(mode, process.cwd(), '')

  // 1. Build the server object dynamically
  const serverConfig: any = {}

  // Add your host settings here
  serverConfig.host = '0.0.0.0' // Exposes to local network/Docker
  serverConfig.allowedHosts = ['pebble-kindling-lavender.ngrok-free.dev'] // Prevents 403 errors if using a proxy/tunnel

  // 2. Add your existing proxy logic if the env variable is present
  if (env.API_PROXY_TARGET) {
    serverConfig.proxy = {
      '/api': {
        target: env.API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    }
  }

  return {
    plugins: [svelte(), tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve('./src/lib'),
      },
    },
    // 3. Pass the structured server object
    server: serverConfig,
  }
})
