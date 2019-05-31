import express from 'express'
import http from 'http'

export const expressEventPromiseHandler = {
  async listen (app: ReturnType<typeof express>, port: number): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      const server: http.Server = app.listen({ port })
        .on('listening', () => resolve(server))
        .on('error', (error) => reject(error))
    })
  }
}
