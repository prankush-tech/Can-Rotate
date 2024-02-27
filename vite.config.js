import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default {
    // config options
    base:"prankush-canRotate",
    plugins: [react()],
  }

  server: {
    host: true
  }