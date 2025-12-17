
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This exposes the API key to the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      // Expose a build-time default for the AI proxy flag; runtime override is still possible via settings
      'process.env.VITE_AI_PROXY_ENABLED': JSON.stringify(env.VITE_AI_PROXY_ENABLED || process.env.VITE_AI_PROXY_ENABLED || 'false'),
      'process.env.AI_PROXY_URL': JSON.stringify(env.AI_PROXY_URL || process.env.AI_PROXY_URL || '')
    }
    ,
    server: (() => {
      const proxyTarget = env.AI_PROXY_URL || process.env.AI_PROXY_URL || 'http://localhost:3456';
      const enabled = (env.VITE_AI_PROXY_ENABLED || process.env.VITE_AI_PROXY_ENABLED) === 'true' || !!env.AI_PROXY_URL || !!process.env.AI_PROXY_URL;
      return enabled ? {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      } : {};
    })()
  }
})
