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
    execute (instruction: ContractExecutionInstruction) {
      const transaction = engineClient.execute(instruction)
      return pubSubClient.publish(`${Events.SIGNATURE_REQUIRED}.${instruction.originatorPk}`, { transaction })
    },
    submitSignedTransaction (signedTransaction: string) {
      return engineClient.submitSignedTransaction(signedTransaction)
    }
  }
}
