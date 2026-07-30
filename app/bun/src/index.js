import { addWorld } from 'utils'

const PORT = process.env.PORT || 3000

Bun.serve({
  port: PORT,
  fetch() {
    console.info('request')
    return new Response(addWorld('Hello'), {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
})

console.log(`Server running at http://localhost:${PORT}`)
