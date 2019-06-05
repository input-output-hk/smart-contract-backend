import { ExecutionEngines } from '../../core'

export interface LoadContractArgs {
  contractAddress: string
  executable: string
}

export interface UnloadContractArgs {
  contractAddress: string
}

export interface ExecuteContractArgs {
  contractAddress: string
  method: string
  methodArgs?: any
}

export type SmartContractResponse = any

export interface ExecutionEngine {
  name: ExecutionEngines,
  load: (args: LoadContractArgs) => Promise<boolean>
  execute: (args: ExecuteContractArgs) => Promise<{ data: SmartContractResponse }>
  unload: (args: UnloadContractArgs) => Promise<boolean>
}
