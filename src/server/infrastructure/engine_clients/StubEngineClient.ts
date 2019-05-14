import { Bundle, Contract, ContractExecutionInstruction, EngineClient } from '../../core'

export function StubEngineClient (): EngineClient {
  return {
    name: 'stub',
    async loadExecutable (contractAddress: Contract['address'], executable: Bundle['executable']) {
      return new Promise((resolve) => resolve({ contractAddress, executable }))
    },
    async unloadExecutable (contractAddress: Contract['address']) {
      return new Promise((resolve) => resolve({ contractAddress }))
    },
    call ({ contractAddress, method, methodArguments }: ContractExecutionInstruction) {
      return { contractAddress, method, methodArguments }
    },
    execute ({ contractAddress, method, methodArguments }: ContractExecutionInstruction) {
      return { contractAddress, method, methodArguments }
    }
  }
}
