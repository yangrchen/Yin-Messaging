import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: () => {
          return '[name]-[hash][extname]';
        },
        entryFileNames: '[name]-[hash].js'
      }
    }
  }
})
