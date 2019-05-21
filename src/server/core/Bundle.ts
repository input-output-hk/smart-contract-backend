import { IExecutableSchemaDefinition } from 'apollo-server'
import { Engine, EngineClient } from '.'

enum ExecutableType {
  docker = 'docker',
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
