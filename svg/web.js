import { cp, rm } from 'bun:fs/promises'
import index from './src/index.html'

const ARG = process.argv[2]

/**
 * serve
 */
if (ARG === 'serve') {
  const server = Bun.serve({
    hostname: '0.0.0.0',
    port: 3000,
    routes: {
      '/': index,
      '/*': { dir: './public' }
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
  const outdir = './out'
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
    const relative = output.path.replace(`${process.cwd()}/`, '')
    console.log(` ${relative}  ${(output.size / 1024).toFixed(1)} KB`)
  }
}
