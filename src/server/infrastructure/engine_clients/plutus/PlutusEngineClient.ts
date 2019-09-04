import { EngineClient } from '../../../../core'
import { NetworkInterface } from '../../../../lib'
import { RetryPromise } from 'promise-exponential-retry'

type Config = {
  executionEndpoint: string,
  networkInterface: NetworkInterface,
}

export function PlutusEngineClient (config: Config): EngineClient {
  const { executionEndpoint, networkInterface } = config
  return {
    name: 'plutus',
    // As we load the contracts at boot time, the execution service
    // may not yet be available, so we allow a connection buffer here
    async loadExecutable ({ contractAddress, executable }) {
      return RetryPromise.retryPromise('loadContract', () => {
        return networkInterface.post(`${executionEndpoint}/loadSmartContract`,
          { contractAddress, executable: executable.toString('base64') }
        )
      }, 10)
    },
    async unloadExecutable (contractAddress) {
      return networkInterface.post(`${executionEndpoint}/unloadSmartContract`, { contractAddress })
    },
    async call ({ contractAddress, method, methodArguments }) {
      return networkInterface.post(`${executionEndpoint}/execute/${contractAddress}/${method}`, methodArguments)
    }
  }
}
