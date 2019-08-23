import { Contract } from '.'

export interface ContractExecutionInstruction {
  originatorPk?: string
  method: string
  contractAddress: Contract['address']
  methodArguments?: any
}
