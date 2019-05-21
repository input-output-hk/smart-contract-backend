import { Contract, Engine, EngineClient } from '../core'
import { BundleFetcher, ContractApiServerController } from '.'
import { ContractRepository } from './lib/ContractRepository'
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
      const { bundle: { executable, graphQlSchema, meta }, address } = contract
      const engineClient = engineClients.get(meta.engine)
      await engineClient.loadExecutable(contractAddress, executable)
      await apiServerController.deploy(address, requireFromString(graphQlSchema)(engineClient))
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
