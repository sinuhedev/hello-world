import http from 'node:http'

const PORT = 8080

const server = http.createServer(async (req, res) => {
  //set the request route
  if (req.url === '/' && req.method === 'GET') {
    //response headers
    res.writeHead(200, { 'Content-Type': 'application/json' })
    //end the response
    res.end(JSON.stringify({ version: process.version, hello: 'world' }))
  } else if (req.url === '/hi' && req.method === 'GET') {
    //response headers
    res.writeHead(200, { 'Content-Type': 'application/json' })
    //end the response
    res.end(
      JSON.stringify({
        hello: 'hi'
      })
    )
  }

  // If no route present
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Route not found' }))
  }
})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`)
})
