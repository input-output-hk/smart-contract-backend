import { Contract } from '.'

export interface ContractExecutionInstruction {
  originatorPk?: string
  method: string
  contractAddress: Contract['address']
  contractCode?: string
  methodArguments?: any
}
