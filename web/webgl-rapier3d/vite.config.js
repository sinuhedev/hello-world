import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

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

    resolve: {
      alias: {
        assets: `${CWD}/src/assets`,
        objects: `${CWD}/src/objects`,
        scenes: `${CWD}/src/scenes`,
        utils: `${CWD}/src/utils`
      }
    },

    build: {
      outDir: '../out',
      emptyOutDir: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const chunks = [
              ['shaders', 'src/assets/shaders'],
              ['react', 'node_modules/react/'],
              ['react', 'node_modules/react-dom/'],
              ['three', 'node_modules/three/build/'],
              ['three-examples', 'node_modules/three/examples/']
            ]

            return chunks.find(([, path]) => id.includes(path))?.[0]
          }
        }
      }
    },

    plugins: [
      {
        name: 'glsl',
        async load(id) {
          if (!id.endsWith('.glsl')) return

          const raw = await readFile(id, 'utf8')
          const code = raw
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([=+\-*/{}();,<>])\s*/g, '$1')
            .trim()

          return `export default ${JSON.stringify(code)};`
        }
      },
      wasm()
    ]
  }
})
