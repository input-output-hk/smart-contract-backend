import { ContractExecutionOptions } from '../..'
import { readContract, executeContract, submitSignedTransaction } from './controller_mapping'

export enum SmartContractEngine {
  solidity = 'solidity',
  plutus = 'plutus'
}

export interface ContractExecutionInstruction {
  engine: SmartContractEngine
  originatorPk?: string
  method: string
  contractAddress: string
  contractCode?: string
  methodArguments?: any
}

export interface ContractExecutionAdapter {
  readContract(payload: ContractExecutionInstruction, executionOptions: ContractExecutionOptions): any
  executeContract(payload: ContractExecutionInstruction, executionOptions: ContractExecutionOptions): Promise<any>
  submitSignedTransaction(
    payload: {
      signedTransaction: string,
      engine: SmartContractEngine,
    },
    executionOptions: ContractExecutionOptions
  ): Promise<any>
}

export const contractExecutionAdapter: ContractExecutionAdapter = {
  executeContract,
  readContract,
  submitSignedTransaction
}
