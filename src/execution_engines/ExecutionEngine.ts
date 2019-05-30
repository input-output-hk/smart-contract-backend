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
  methodArgs: any
}

export type SmartContractResponse = any

export interface ExecutionEngine {
  load: (args: LoadContractArgs) => Promise<boolean>
  execute: (args: ExecuteContractArgs) => Promise<{ data: SmartContractResponse }>
  unload: (args: UnloadContractArgs) => Promise<boolean>
}

export enum ExecutionEngines {
  docker = 'docker',
  nodejs = 'nodejs'
}

export enum DockerExecutionEngineContext {
  docker = 'docker',
  host = 'host'
}
