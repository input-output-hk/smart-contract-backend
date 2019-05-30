import { PubSubEngine } from 'apollo-server'
import { ContractExecutionInstruction, EngineClient, Events } from '../core'

type Config = {
  engineClient: EngineClient,
  pubSubClient: PubSubEngine
}

export function ContractInteractionController (config: Config) {
  const { engineClient, pubSubClient } = config
  return {
    call (instruction: ContractExecutionInstruction) {
      return engineClient.call(instruction)
    },
    async execute (instruction: ContractExecutionInstruction) {
      const response = await engineClient.execute(instruction)
      await pubSubClient.publish(`${Events.SIGNATURE_REQUIRED}.${instruction.originatorPk}`, { transaction: response.data })
      return response.data
    },
    submitSignedTransaction (signedTransaction: string) {
      return engineClient.submitSignedTransaction(signedTransaction)
    }
  }
}
