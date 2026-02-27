import { createServer } from 'node:http'
import { addWorld } from '#utils'

process.loadEnvFile()
const { MESSAGE } = process.env

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(addWorld(MESSAGE))
})

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000')
})
