import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const CWD = process.cwd()

  return {
    server: {
      host: '0.0.0.0',
      port: 3000
    },

    root: `src`,
    envDir: CWD,
    publicDir: `${CWD}/public`,

    build: {
      outDir: '../out',
      emptyOutDir: true,
      cssMinify: false
    },

    plugins: [tailwindcss()]
  }
})
