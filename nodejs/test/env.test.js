import test from 'node:test'

test('env', () => {
  process.loadEnvFile()
  const { MESSAGE } = process.env

  console.info(MESSAGE)
})
