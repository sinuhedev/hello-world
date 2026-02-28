import { createServer } from 'node:http'
import { addWorld } from '#utils'

process.loadEnvFile()
const { PORT } = process.env

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(addWorld('Hello'))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on 127.0.0.1:${PORT}`)
})
