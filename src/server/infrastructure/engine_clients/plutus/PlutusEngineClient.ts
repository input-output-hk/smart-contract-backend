import { EngineClient } from '../../../../core'
import { NetworkInterface } from '../../../../lib'

type Config = {
  executionEndpoint: string,
  networkInterface: NetworkInterface,
}

export function PlutusEngineClient (config: Config): EngineClient {
  const { executionEndpoint, networkInterface } = config
  return {
    name: 'plutus',
    async loadExecutable ({ contractAddress, executable }) {
      return networkInterface.post(`${executionEndpoint}/loadSmartContract`,
        { contractAddress, executable: executable.toString('base64') }
      )
    },
    async unloadExecutable (contractAddress) {
      return networkInterface.post(`${executionEndpoint}/unloadSmartContract`, { contractAddress })
    },
    async call ({ contractAddress, method, methodArguments }) {
      return networkInterface.post(`${executionEndpoint}/execute/${contractAddress}/${method}`, methodArguments)
    }
  }
}
