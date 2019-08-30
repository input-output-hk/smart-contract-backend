import { Contract, ContractCallInstruction, EngineClient } from '../../../core'

export function StubEngineClient (): EngineClient {
  return {
    name: 'stub',
    async loadExecutable ({ contractAddress, executable }) {
      return Promise.resolve({ contractAddress, executable })
    },
    async unloadExecutable (contractAddress: Contract['address']) {
      return Promise.resolve(contractAddress)
    },
    call ({ contractAddress, method, methodArguments }: ContractCallInstruction) {
      return { contractAddress, method, methodArguments }
    }
  }
}
