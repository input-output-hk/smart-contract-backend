import { IExecutableSchemaDefinition } from 'apollo-server'
import { Engine, EngineClient } from '.'

export enum ExecutableType {
  docker = 'docker',
  js = 'js',
  wasm = 'wasm'
}

export type Bundle = {
  executable: string
  graphQlSchema: (engineClient: EngineClient) => IExecutableSchemaDefinition
  meta: {
    engine: Engine
    executableType: ExecutableType
    hash: string
    dockerImageRepository?: string
  }
}
