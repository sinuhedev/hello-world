import { defineConfig } from 'vite'

export default defineConfig(() => {
  const CWD = process.cwd()

  return {
    server: {
      host: '0.0.0.0',
      port: 3000
    },

    base: '',
    root: `${CWD}/src/web`,

    build: {
      outDir: `${CWD}/out/web`,
      emptyOutDir: true
    },

    plugins: []
  }
})
