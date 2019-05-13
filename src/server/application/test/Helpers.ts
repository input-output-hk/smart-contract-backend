import { createServer, Server } from 'net'

export function RogueService () {
  const server: Server = createServer()
  return {
    async listen (port: number) {
      return new Promise((resolve, reject) => {
        server
          .once('listening', () => resolve(true))
          .on('error', (error) => reject(error))
        server.listen(port)
      })
    },
    close () {
      server.close()
    }
  }
}
