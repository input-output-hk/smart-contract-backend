import { Bundle, Contract, ContractCallInstruction } from '.'

export interface EngineClient {
  name: string
  loadExecutable: (params: {
    contractAddress: Contract['address'],
    executable: Bundle['executable']
  }) => Promise<any>
  unloadExecutable: (contractAddress: Contract['address']) => Promise<any>
  call: (executionInstruction: ContractCallInstruction) => any
}
