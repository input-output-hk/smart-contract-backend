import { EngineClient } from '../../../../core'
import { NetworkInterface } from '../../../application/lib/NetworkInterface'

type Config = {
  executionEndpoint: string,
  networkInterface: NetworkInterface,
  walletEndpoint: string,
}

export function PlutusEngineClient (
  config: Config): EngineClient {
  const { executionEndpoint, networkInterface, walletEndpoint } = config
  return {
    name: 'plutus',
    async loadExecutable ({ contractAddress, executable }) {
      return networkInterface.post(`${executionEndpoint}/loadSmartContract`,
        { contractAddress, executable }
      )
    },
    async unloadExecutable (contractAddress) {
      return networkInterface.post(`${executionEndpoint}/unloadSmartContract`, { contractAddress })
    },
    async call () {
      throw new Error('Plutus engine does not yet support state calls')
    },
    execute ({ contractAddress, method, methodArguments }) {
      return networkInterface.post(`${executionEndpoint}/execute/${contractAddress}/${method}`, methodArguments)
    },
    async submitSignedTransaction (signedTransaction) {
      return networkInterface.post(`${walletEndpoint}/transaction/submitSignedTransaction`, { transaction: signedTransaction })
    }
  }
}
