import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cartQuotePlugin } from './vite.cart-quote-plugin'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages conserve son sous-chemin ; Netlify publie le site à la racine.
  base: process.env.NETLIFY ? '/' : '/academie_salsabil/',
  plugins: [react(), cartQuotePlugin()],
})
