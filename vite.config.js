import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: env.VITE_PROXY_COOKIE_DOMAIN || 'localhost',
        },
        '/sanctum': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: env.VITE_PROXY_COOKIE_DOMAIN || 'localhost',
        },
        '/auth': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: env.VITE_PROXY_COOKIE_DOMAIN || 'localhost',
        },
      },
    },
  }
})
