import { solidityExecutionController, plutusExecutionController } from '../controllers'
import { SmartContractEngine, ContractExecutionInstruction } from '.'
import { ContractExecutionOptions } from '../..'
import { initializeWeb3Instance, requestSignature } from './external'

export function readContract (payload: ContractExecutionInstruction, opts: ContractExecutionOptions): any {
  switch (payload.engine) {
    case SmartContractEngine.solidity:
      const web3Instance = initializeWeb3Instance(opts.web3Provider)
      return solidityExecutionController.call(payload, web3Instance)
    case SmartContractEngine.plutus:
      return plutusExecutionController.call(payload, opts.plutus.executionEndpoint)
    default:
      throw new Error('Engine unsupported')
  }
}

export async function executeContract (payload: ContractExecutionInstruction, opts: ContractExecutionOptions): Promise<any> {
  switch (payload.engine) {
    case SmartContractEngine.solidity:
      const web3Instance = initializeWeb3Instance(opts.web3Provider)
      const transactionS = await solidityExecutionController.execute(payload, web3Instance)
      await requestSignature({ publicKey: payload.originatorPk, transaction: transactionS })
      return transactionS
    case SmartContractEngine.plutus:
      const transactionP = await plutusExecutionController.execute(payload, opts.plutus.executionEndpoint)
      await requestSignature({ publicKey: payload.originatorPk, transaction: transactionP })
      return transactionP
    default:
      throw new Error('Engine unsupported')
  }
}

export function submitSignedTransaction ({ signedTransaction, engine }: { signedTransaction: string, engine: SmartContractEngine }, opts: ContractExecutionOptions): Promise<any> {
  switch (engine) {
    case SmartContractEngine.solidity:
      const web3Instance = initializeWeb3Instance(opts.web3Provider)
      return solidityExecutionController.submitSignedTransaction(signedTransaction, web3Instance)
    case SmartContractEngine.plutus:
      return plutusExecutionController.submitSignedTransaction(signedTransaction, opts.plutus.walletEndpoint)
    default:
      throw new Error('Engine unsupported')
  }
}
