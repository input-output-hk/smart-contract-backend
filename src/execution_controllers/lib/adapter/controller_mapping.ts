import { solidityExecutionController } from '../controllers'
import { SmartContractEngine, ContractExecutionInstruction } from '.'
import { ContractExecutionOptions } from '../..'
import { requestSignature, initializeWeb3Instance } from './external'

export function readContract(payload: ContractExecutionInstruction, opts: ContractExecutionOptions): any {
  switch (payload.engine) {
    case SmartContractEngine.solidity:
      const web3Instance = initializeWeb3Instance(opts.web3Provider)
      return solidityExecutionController.call(payload, web3Instance)
    default:
      throw new Error('Engine unsupported')
  }
}

export async function executeContract(payload: ContractExecutionInstruction, opts: ContractExecutionOptions): Promise<any> {
  switch (payload.engine) {
    case SmartContractEngine.solidity:
      const web3Instance = initializeWeb3Instance(opts.web3Provider)
      const transactionS = await solidityExecutionController.execute(payload, web3Instance)
      await requestSignature({ publicKey: payload.originatorPk, transaction: transactionS }, opts.cardanoClientProxiUri)
      return transactionS
    default:
      throw new Error('Engine unsupported')
  }
}

export function submitSignedTransaction({ signedTransaction, engine }: { signedTransaction: string, engine: SmartContractEngine }, opts: ContractExecutionOptions): Promise<any> {
  switch (engine) {
    case SmartContractEngine.solidity:
      const web3Instance = initializeWeb3Instance(opts.web3Provider)
      return solidityExecutionController.submit(signedTransaction, web3Instance)
    default:
      throw new Error('Engine unsupported')
  }
}
