import { Contract, Engine, EngineClient } from '../core'
import { ContractRepository } from './lib/ContractRepository'
import { BundleFetcher, ContractApiServerController } from './'
const requireFromString = require('require-from-string')

type Config = {
  apiServerController: ReturnType<typeof ContractApiServerController>
  contractRepository: ContractRepository
  bundleFetcher: BundleFetcher
  engineClients: Map<Engine, EngineClient>
}

export function ContractController (config: Config) {
  const { apiServerController, bundleFetcher, contractRepository, engineClients } = config
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
      //  Next _________________________________________
      //  Load executable into the engine via the client
      // _______________________________________________
      await apiServerController.deploy(address, requireFromString(graphQlSchema)(engineClient))
      return true
    },
    async unload (contractAddress: Contract['address']): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) return false
      await apiServerController.tearDown(contractAddress)
      //  Next _____________
      //  Unload executable
      // ___________________
      return contractRepository.remove(contract.address)
    }
  }
}
