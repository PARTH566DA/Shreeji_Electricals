import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned to 5173: the backend CORS allow-list (application.yml) only permits
    // http://localhost:5173. strictPort makes Vite FAIL LOUDLY if 5173 is taken by a
    // stale process, instead of silently drifting to 5174 (which would break every
    // API call via CORS). Kill the stale process rather than changing this port.
    port: 5173,
    strictPort: true,
    // Loopback only — don't expose the dev server (source + fs access) to the whole LAN.
    host: 'localhost',
  },
})
