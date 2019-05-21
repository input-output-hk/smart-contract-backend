export interface LoadContractIntoEngine {
  contractAddress: string
  executable: string
}

export interface UnloadContractFromEngine {
  contractAddress: string
}

export interface ExecuteContract {
  contractAddress: string
  method: string
  methodArgs: any
}

export type SmartContractResponse = any

export interface Engine {
  load: (args: LoadContractIntoEngine) => Promise<boolean>
  execute: (args: ExecuteContract) => Promise<{ data: SmartContractResponse } | { error: string }>
  unload: (args: UnloadContractFromEngine) => Promise<boolean>
}
