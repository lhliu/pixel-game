import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages usually runs on https://<user>.github.io/<repo-name>/
  // Set this to '/<repo-name>/'
  // If your repo is named exactly "pixel-game", keep this.
  // If your repo has a different name, CHANGE THIS LINE:
  base: '/pixel-game/',
})
