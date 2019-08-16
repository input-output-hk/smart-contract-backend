import { PubSubEngine } from 'apollo-server'
import { Contract, ContractRepository, Engine, EngineClient, ContractExecutionInstruction, Events, Endpoint } from '../../core'
import { BundleFetcher, ContractApiServerController } from '.'
import { ContractNotLoaded } from '../../execution_service/errors';
const requireFromString = require('require-from-string')

type Config = {
  apiServerController: ReturnType<typeof ContractApiServerController>
  contractRepository: ContractRepository
  bundleFetcher: BundleFetcher
  engineClients: Map<Engine, EngineClient>
  pubSubClient: PubSubEngine
}

export function ContractController(config: Config) {
  const {
    apiServerController,
    bundleFetcher,
    contractRepository,
    engineClients,
    pubSubClient
  } = config
  return {
    async load(contractAddress: Contract['address'], bundleUri: string): Promise<boolean> {
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
      const { bundle: { schema, meta, executable }, address } = contract
      const engineClient = engineClients.get(meta.engine)
      await engineClient.loadExecutable({ contractAddress: address, executable })

      // Now we cache the bundle somewhere
      return true
    },
    async call(instruction: ContractExecutionInstruction) {
      // get our ref or throw
      const contract = await contractRepository.find(instruction.contractAddress)
      if (!contract) {
        throw new ContractNotLoaded()
      }

      // Make the call
      const engineClient = engineClients.get(contract.bundle.meta.engine)

      // This schema should be a valid js string, that has no
      // other imports. We can do this with tsc --out
      // 
      // As this is runtime, we don't know the relevant generics of Endpoint,
      // but we can still leverage the interface
      const endpoint = requireFromString(contract.bundle.schema)[instruction.method] as Endpoint<any, any, any>
      const response = await endpoint.call(
        instruction.methodArguments,
        // State can go here at some point
        // TODO: Update the engineClient accept a better signature
        (_args, _state) => engineClient.call(instruction)
      )

      await pubSubClient.publish(`${Events.SIGNATURE_REQUIRED}.${instruction.originatorPk}`, { transactionSigningRequest: { transaction: JSON.stringify(response.data) } })
      return response.data
    },
    async unload(contractAddress: Contract['address']): Promise<boolean> {
      let contract = await contractRepository.find(contractAddress)
      if (!contract) return false
      const engineClient = engineClients.get(contract.bundle.meta.engine)
      await apiServerController.tearDown(contractAddress)
      await engineClient.unloadExecutable(contractAddress)
      return contractRepository.remove(contract.address)
    }
  }
}
