import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cartQuotePlugin } from './vite.cart-quote-plugin'

// https://vite.dev/config/
export default defineConfig({
  // Le développement local et Netlify utilisent la racine. Le sous-chemin
  // GitHub Pages reste disponible uniquement pour un build explicitement dédié.
  base: process.env.GITHUB_PAGES ? '/academie_salsabil/' : '/',
  plugins: [react(), cartQuotePlugin()],
})
