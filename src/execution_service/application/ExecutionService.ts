import http from 'http'
import { httpEventPromiseHandler } from '../../lib'
import { Api, ExecutionEngine } from '.'

export interface Config {
  apiPort: number
  engine: ExecutionEngine
}

export function ExecutionService (config: Config) {
  const api = Api(config.engine)
  let server: http.Server
  return {
    engineName: config.engine.name,
    async boot (): Promise<http.Server> {
      server = await api.app.listen({ port: config.apiPort })
      return server
    },
    async shutdown (): Promise<void> {
      await httpEventPromiseHandler.close(server)
    }
  }
}
