import { ExecutionEngines } from '../../../core'
import {
  ExecutionEngine,
  ExecuteContractArgs,
  LoadContractArgs,
  UnloadContractArgs
} from '../../application'

export function StubExecutionEngine (): ExecutionEngine {
  return {
    name: ExecutionEngines.stub,
    load (args: LoadContractArgs) {
      console.log('StubExecutionEngine:execute args:', args)
      return Promise.resolve(true)
    },
    execute (args: ExecuteContractArgs) {
      console.log('StubExecutionEngine:execute args:', args)
      return Promise.resolve({ data: 'some-response' })
    },
    unload (args: UnloadContractArgs) {
      console.log('StubExecutionEngine:unload args:', args)
      return Promise.resolve(true)
    }
  }
}
