import { cp, rm } from 'bun:fs/promises'
import index from './src/index.html'

const ARG = process.argv[2]

/**
 * dev
 */
if (ARG === 'dev') {
  Bun.serve({
    hostname: '0.0.0.0',
    port: 3000,

    routes: {
      '/*': index
    },

    development: {
      hmr: true,
      console: true
    }
  })
}

/**
 * build
 */
if (ARG === 'build') {
  await rm('./out', { recursive: true, force: true })

  await Bun.build({
    entrypoints: ['./src/index.html'],
    outdir: './out',
    target: 'browser',
    minify: true,
    env: 'PUBLIC_*'
  })

  await cp('./public', './out', { recursive: true })
}
