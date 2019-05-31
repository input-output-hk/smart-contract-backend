import http from 'http'
import { PubSubEngine } from 'apollo-server'
import { ContractRepository, Engine, EngineClient } from '../../core'
import { httpPromises, PortMapper, PortMapperConfig } from '../../lib'
import {
  Api,
  BundleFetcher,
  ContractApiServerController,
  ContractController
} from '.'

export type Config = {
  apiPort: number
  contractRepository: ContractRepository
  portMapperConfig: PortMapperConfig
  engineClients: Map<Engine, EngineClient>
  bundleFetcher: BundleFetcher
  pubSubClient: PubSubEngine
}

export function Server (config: Config) {
  const { contractRepository, portMapperConfig, engineClients, bundleFetcher, pubSubClient } = config
  const portMapper = PortMapper(portMapperConfig)
  const apiServerController = ContractApiServerController(portMapper)
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
        httpPromises.close(apiServer),
        apiServerController.closeAllServers()
      ])
    }
  }
}
