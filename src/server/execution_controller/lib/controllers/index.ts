import { ContractExecutionInstruction } from '../adapter'

export interface ExecutionController<C, E, S> {
  call: (payload: ContractExecutionInstruction, providerInstance: any) => Promise<C>
  execute: (payload: ContractExecutionInstruction, providerInstance: any) => Promise<E>
  submit: (signedTransaction: string, providerInstance: any) => Promise<S>
}

export { solidityExecutionController } from './solidity'