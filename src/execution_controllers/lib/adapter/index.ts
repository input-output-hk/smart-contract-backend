import { ContractExecutionOptions } from '../..'
import { readContract, executeContract, submitSignedTransaction } from './controller_mapping'
import { publishNewContract } from './external'

export enum SmartContractEngine {
  solidity = 'solidity'
}

export interface ContractExecutionInstruction {
  engine: SmartContractEngine
  originatorPk?: string
  method: string
  contractAddress: string
  contractCode: string
  methodArguments?: any[]
}

export interface ContractExecutionAdapter {
  publishNewContract(
    args: { engine: SmartContractEngine, address: string, name: string, contractCode: string },
    proxyUri: string
  ): Promise<any>
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
  publishNewContract,
  readContract,
  submitSignedTransaction
}
