import test from 'node:test'

test('env', () => {
  process.loadEnvFile()
  const { PORT } = process.env

  console.info(PORT)
})
