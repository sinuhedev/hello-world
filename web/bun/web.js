import { cp, rm } from 'bun:fs/promises'
import path from 'node:path'
import { serve } from 'bun'
import index from './src/index.html'

const ARG = process.argv[2]

/**
 * dev
 */
if (ARG === 'dev') {
  const server = serve({
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

  console.log(`🚀 Server running at ${server.url}`)
}

/**
 * build
 */
if (ARG === 'build') {
  const outdir = path.join(process.cwd(), 'out')
  await rm(outdir, { recursive: true, force: true })

  const result = await Bun.build({
    outdir,
    entrypoints: ['./src/index.html'],
    target: 'browser',
    minify: true,
    env: 'PUBLIC_*'
  })

  await cp('./public', './out', { recursive: true })

  for (const output of result.outputs) {
    console.log(
      ` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`
    )
  }
}
