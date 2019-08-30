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
  contractDirectory: string
  contractRepository: ContractRepository
  engineClients: Map<Engine, EngineClient>
  pubSubClient: PubSubEngine
}

export function Server (config: Config) {
  const { contractRepository, engineClients, pubSubClient, contractDirectory } = config
  const contractController = ContractController({
    contractDirectory,
    contractRepository,
    engineClients,
    pubSubClient
  })
  let api = Api({
    contractController,
    contractRepository,
    pubSubClient
  })
  let apiServer: http.Server
  return {
    preloadContracts (): Promise<boolean[]> {
      return contractController.loadAll()
    },
    async boot (): Promise<void> {
      apiServer = await api.app.listen({ port: config.apiPort })
      api.apolloServer.installSubscriptionHandlers(apiServer)
    },
    async shutdown (): Promise<void> {
      await Promise.all([
        httpEventPromiseHandler.close(apiServer)
      ])
    }
  }
}
