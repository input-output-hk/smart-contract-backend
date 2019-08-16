import { Engine } from '.'

export enum ExecutableType {
  docker = 'docker',
  js = 'js',
  wasm = 'wasm'
}

export type Bundle = {
  executable: string
  schema: string
  meta: {
    engine: Engine
    executableType: ExecutableType
    hash: string
  }
}
