import { PubSubEngine } from 'apollo-server'
import { Contract, Engine, EngineClient } from '../core'
import { BundleFetcher, ContractApiServerController, ContractInteractionController } from '.'
import { ContractRepository } from './lib/ContractRepository'
const requireFromString = require('require-from-string')

type Config = {
  apiServerController: ReturnType<typeof ContractApiServerController>
  contractRepository: ContractRepository
  bundleFetcher: BundleFetcher
  engineClients: Map<Engine, EngineClient>
  pubSubClient: PubSubEngine
}

export function ContractController (config: Config) {
  const {
    apiServerController,
    bundleFetcher,
    contractRepository,
    engineClients,
    pubSubClient
  } = config
  return {
    async load (contractAddress: Contract['address'], bundleUri: string): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) {
        const bundle = await bundleFetcher.fetch(bundleUri)
        contract = {
          id: contractAddress,
          address: contractAddress,
          bundle
        }
        await contractRepository.add(contract)
      }
      const { bundle: { graphQlSchema, meta }, address } = contract
      const engineClient = engineClients.get(meta.engine)
      await engineClient.loadExecutable({ contractAddress: address, executable: meta.dockerImageRepository })
      const schema = requireFromString(graphQlSchema)(ContractInteractionController({ engineClient, pubSubClient }))
      await apiServerController.deploy(
        address,
        schema
      )
      return true
    },
    async unload (contractAddress: Contract['address']): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) return false
      const engineClient = engineClients.get(contract.bundle.meta.engine)
      await apiServerController.tearDown(contractAddress)
      await engineClient.unloadExecutable(contractAddress)
      return contractRepository.remove(contract.address)
    }
  }
}
