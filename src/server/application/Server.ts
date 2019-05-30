import http from 'http'
import { PubSubEngine } from 'apollo-server'
import { Engine, EngineClient } from '../core'
import {
  Api,
  BundleFetcher,
  ContractApiServerController,
  ContractController,
  PortManager,
  PortManagerConfig
} from '.'
import { ContractRepository } from './lib/ContractRepository'
import { close } from '../lib/http'

export type Config = {
  apiPort: number
  contractRepository: ContractRepository
  portManagerConfig: PortManagerConfig
  engineClients: Map<Engine, EngineClient>
  bundleFetcher: BundleFetcher
  pubSubClient: PubSubEngine
}

export function Server (config: Config) {
  const { contractRepository, portManagerConfig, engineClients, bundleFetcher, pubSubClient } = config
  const portManager = PortManager(portManagerConfig)
  const apiServerController = ContractApiServerController(portManager)
  const contractController = ContractController({
    contractRepository,
    bundleFetcher,
    apiServerController,
    engineClients,
    pubSubClient
  })
  let api = Api({
    contractController,
    contractRepository,
    apiServerController,
    pubSubClient
  })
  let apiServer: http.Server
  return {
    async boot (): Promise<void> {
      apiServer = await api.app.listen({ port: config.apiPort })
      api.apolloServer.installSubscriptionHandlers(apiServer)
    },
    async shutdown (): Promise<void> {
      await Promise.all([
        close(apiServer),
        apiServerController.closeAllServers()
      ])
    }
  }
}
