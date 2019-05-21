import { PubSubEngine } from 'apollo-server'
import { Bundle, Contract, ContractExecutionInstruction, EngineClient, Events } from '../../core'

export function StubEngineClient (pubSubClient: PubSubEngine): EngineClient {
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
    execute ({ originatorPk }: ContractExecutionInstruction) {
      return pubSubClient.publish(`${Events.SIGNATURE_REQUIRED}.${originatorPk}`, { transaction: '123' })
    }
  }
}
