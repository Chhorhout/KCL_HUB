import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 5000,
  },
  // Ensure environment variables are loaded
  envPrefix: 'VITE_',
})


