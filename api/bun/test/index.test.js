import { test } from 'bun:test'
import { addWorld } from 'utils'

test('util', () => {
  console.info(addWorld('Hello'))
})
