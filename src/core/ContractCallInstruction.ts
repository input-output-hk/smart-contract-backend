import { Contract } from '.'

export interface ContractCallInstruction {
  originatorPk?: string
  method: string
  contractAddress: Contract['address']
  methodArguments?: any
}
