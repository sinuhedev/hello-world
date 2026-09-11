import { execSync } from 'bun:child_process'
import { cp, rm } from 'bun:fs/promises'
import { version } from './package.json' with { type: 'json' }
import index from './src/index.html'

const ENV = process.env.BUN_ENV
const ARG = process.argv[2]

const envPlugin = {
  name: 'inject-env-html',
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, async (args) => {
      let html = await Bun.file(args.path).text()

      let gitHash = 'unknown'
      try {
        gitHash = execSync('git rev-parse --short HEAD', {
          encoding: 'utf8'
        }).trim()
      } catch {}

      html = html.replace(/%(\w+)%/g, (_, key) => {
        if (key === 'VERSION')
          return `version=${version}, env=${ENV}, date=${new Date().toISOString()}, commit=${gitHash}`
        return process.env[key] ?? ''
      })

      return {
        contents: html,
        loader: 'html'
      }
    })
  }
}

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
    env: 'PUBLIC_*',
    plugins: [envPlugin]
  })

  await cp('./public', './out', { recursive: true })

  for (const output of result.outputs) {
    const relative = output.path.replace(`${process.cwd()}/`, '')
    console.log(` ${relative}  ${(output.size / 1024).toFixed(1)} KB`)
  }
}

export default envPlugin
