import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default {
    // config options
    plugins: [react()],
  }

  server: {
    host: true
  }