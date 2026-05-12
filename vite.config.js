import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// base must match the subdirectory on GoDaddy: https://tools.gdm-enviro.com/geochem/
export default defineConfig({
  plugins: [react()],
  base: '/geochem/',
})
