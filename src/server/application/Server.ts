import http from 'http'
import { PubSubEngine } from 'apollo-server'
import { ContractRepository, Engine, EngineClient } from '../../core'
import { httpEventPromiseHandler } from '../../lib'
import {
  Api,
  ContractController
} from '.'

export type Config = {
  apiPort: number
  contractRepository: ContractRepository
  engineClients: Map<Engine, EngineClient>
  pubSubClient: PubSubEngine
}

export function Server (config: Config) {
  const { contractRepository, engineClients, pubSubClient } = config
  const contractController = ContractController({
    contractRepository,
    engineClients,
    pubSubClient
  })
  let api = Api({
    contractController,
    contractRepository,
  })
  let apiServer: http.Server
  return {
    async boot (): Promise<void> {
      apiServer = await api.app.listen({ port: config.apiPort })
      api.apolloServer.installSubscriptionHandlers(apiServer)
    },
    async shutdown (): Promise<void> {
      await Promise.all([
        httpEventPromiseHandler.close(apiServer),
      ])
    }
  }
}
