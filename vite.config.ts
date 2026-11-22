import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' para que funcione en GitHub Pages (https://danieldavilacuadros.github.io/ppto_2027_IM/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
