import * as http from 'http'

export const httpEventPromiseHandler = {
  async listen (server: http.Server, port: number): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      server.listen({ port })
        .on('listening', resolve)
        .on('error', reject)
    })
  },
  async close (server: http.Server): Promise<void> {
    return new Promise((resolve, reject) => {
      server.close()
        .on('close', resolve)
        .on('error', reject)
    })
  }
}
