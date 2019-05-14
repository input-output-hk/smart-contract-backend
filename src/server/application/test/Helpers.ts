import { createServer, Server } from 'net'

export function RogueService () {
  const server: Server = createServer()
  return {
    async listen (port: number) {
      return new Promise((resolve, reject) => {
        server.listen(port)
          .once('listening', () => resolve(true))
          .on('error', (error) => reject(error))
      })
    },
    close () {
      server.close()
    }
  }
}
