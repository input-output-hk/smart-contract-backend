import http from 'http'
import { listen, close } from '../lib/http'
import { Engine, EngineClient } from '../core'
import { ContractController } from './ContractController'
import {
  PortManagerConfig, PortManager,
  ContractApiServerController,
  ServiceApi,
  ContractProxy
} from '.'
import { ContractRepository } from './lib/ContractRepository'
import { BundleFetcher } from './BundleFetcher'

export type Config = {
  serviceApi: { port: number }
  contractProxy: { port: number }
  contractRepository: ContractRepository
  portManagerConfig: PortManagerConfig
  engineClients: Map<Engine, EngineClient>
  bundleFetcher: BundleFetcher
}

export function Server (config: Config) {
  const { contractRepository, portManagerConfig, engineClients, bundleFetcher } = config
  const portManager = PortManager(portManagerConfig)
  const apiServerController = ContractApiServerController(portManager)
  const contractController = ContractController({
    contractRepository,
    bundleFetcher,
    apiServerController,
    engineClients
  })
  let serviceApi = ServiceApi({
    contractController,
    contractRepository
  })
  let serviceApiHttpServer: http.Server
  let contractProxy = ContractProxy({
    ...config.contractProxy,
    apiServerController,
    catchAllUri: `http://localhost:${config.serviceApi.port}`
  })
  return {
    async boot (): Promise<void> {
      await listen(contractProxy, config.contractProxy.port)
      serviceApiHttpServer = await serviceApi.listen({ port: config.serviceApi.port })
    },
    async shutdown (): Promise<void> {
      await Promise.all([
        close(serviceApiHttpServer),
        close(contractProxy),
        apiServerController.closeAllServers()
      ])
    }
  }
}
