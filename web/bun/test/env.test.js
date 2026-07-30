import { test } from 'bun:test'
import { env } from 'utils'

test('env', () => {
  console.info(env)
})
