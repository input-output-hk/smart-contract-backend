import { PubSubEngine } from 'apollo-server'
import { ContractExecutionInstruction, EngineClient, Events } from '../../core'

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
      // 'response.data.data.response' used as a placeholder for the transaction string
      await pubSubClient.publish(`${Events.SIGNATURE_REQUIRED}.${instruction.originatorPk}`, { transactionSigningRequest: { transaction: response.data.data.response } })
      return response.data
    },
    submitSignedTransaction (signedTransaction: string) {
      return engineClient.submitSignedTransaction(signedTransaction)
    }
  }
}
