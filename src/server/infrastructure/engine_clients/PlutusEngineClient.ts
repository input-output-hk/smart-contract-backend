import { Bundle, Contract, ContractExecutionInstruction, EngineClient } from '../../core'
import { NetworkInterface } from '../../application/lib/NetworkInterface'

type Config = {
  executionEndpoint: string,
  walletEndpoint: string,
  networkInterface: NetworkInterface
}

export function PlutusEngineClient (
  config: Config): EngineClient {
  const { executionEndpoint, networkInterface } = config
  return {
    name: 'plutus',
    async loadExecutable (
      contractAddress: Contract['address'],
      executable: Bundle['meta']['dockerImageRepository']
    ) {
      return networkInterface.post(`${executionEndpoint}/loadSmartContract`,
        { contractAddress, executable }
      )
    },
    async unloadExecutable (contractAddress: Contract['address']) {
      return networkInterface.post(`${executionEndpoint}/unloadSmartContract`, { contractAddress })
    },
    async call () {
      throw new Error('Plutus engine does not yet support state calls')
    },
    execute ({ contractAddress, method, methodArguments }: ContractExecutionInstruction) {
      return networkInterface.post(`${executionEndpoint}/execute/${contractAddress}/${method}`, methodArguments)
    }
  }
}
