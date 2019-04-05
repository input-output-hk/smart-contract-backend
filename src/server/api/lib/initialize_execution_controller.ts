import { ContractExecution } from '../../execution_controller'
import { SmartContractEngine } from '../../execution_controller/lib/adapter'

export function initializeContractExecutionController (engine: SmartContractEngine) {
  const { EXECUTION_SERVICE_URI, WALLET_SERVICE_URI, WEB3_PROVIDER } = process.env

  if (engine === SmartContractEngine.plutus) {
    if (!EXECUTION_SERVICE_URI || !WALLET_SERVICE_URI) throw new Error('Missing Plutus environment')
  }

  if (engine === SmartContractEngine.solidity) {
    if (WEB3_PROVIDER) throw new Error('Missing Solidity environment')
  }

  return new ContractExecution({
    plutus: {
      executionEndpoint: EXECUTION_SERVICE_URI,
      walletEndpoint: WALLET_SERVICE_URI
    },
    web3Provider: WEB3_PROVIDER
  })
}
