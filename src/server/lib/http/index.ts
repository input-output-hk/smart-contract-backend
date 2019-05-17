import * as http from 'http'

export async function listen (server: http.Server, port: number): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    server.listen({ port })
      .on('listening', () => resolve(server))
      .on('error', (error) => reject(error))
  })
}

export async function close (server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close()
      .on('close', () => resolve())
      .on('error', (error) => reject(error))
  })
}
