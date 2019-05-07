import { GraphQLSchema } from 'graphql'
import { Engine, EngineClient } from '.'

enum ExecutableType {
  docker = 'docker',
  wasm = 'wasm'
}

export type Bundle = {
  executable: string
  graphQlSchema: (engineClient: EngineClient) => GraphQLSchema
  meta: {
    engine: Engine
    executableType: ExecutableType
    hash: string
    dockerImageRepository?: string
  }
}
