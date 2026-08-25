const env = {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_VAR: process.env.PUBLIC_VAR
}

console.info(env)

export { env }
