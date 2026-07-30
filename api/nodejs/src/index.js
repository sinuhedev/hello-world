import { createServer } from 'node:http'
import { addWorld } from '#utils'

const PORT = process.env.PORT || 3000

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(addWorld('Hello'))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on localhost:${PORT}`)
})
