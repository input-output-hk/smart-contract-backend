import { Bundle, Contract, ContractExecutionInstruction } from '.'

export interface EngineClient {
  name: string
  loadExecutable: (params: {
    contractAddress: Contract['address'],
    executable: Bundle['executable']
  }) => Promise<any>
  unloadExecutable: (contractAddress: Contract['address']) => Promise<any>
  call: (executionInstruction: ContractExecutionInstruction) => any
  execute: (executionInstruction: ContractExecutionInstruction) => Promise<any>
  submitSignedTransaction: (transaction: string) => Promise<any>
}
