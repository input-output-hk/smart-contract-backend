import { Contract } from '../core'
import { ContractRepository } from './lib/ContractRepository'
import { BundleFetcher } from './'

type Config = {
  contractRepository: ContractRepository
  bundleFetcher: BundleFetcher
}

export function ContractController (config: Config) {
  const { contractRepository, bundleFetcher } = config
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
      // Todo:
      //  Select engine client as defined in bundle meta
      //  Load executable into the engine via the client
      //  Load and call the GraphQl schema generating module, passing the engine client
      //  Deploy GraphQL server
      return true
    },
    async unload (contractAddress: Contract['address']): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) return false
      // Todo:
      //  Tear down API server
      //  Unload executable
      return contractRepository.remove(contract.address)
    }
  }
}
