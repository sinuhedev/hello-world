import { test } from 'bun:test'
import { env } from 'utils'

test('env', () => {
  console.info(env.PUBLIC_VAR)
  console.info(env.PUBLIC_TITLE)
})

test('hi', () => {
  console.info('hola')
})
