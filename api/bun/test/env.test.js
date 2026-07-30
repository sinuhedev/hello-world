import { test } from 'bun:test'

test('env', () => {
  const { PORT } = process.env
  console.info(PORT)
})
