import { Contract, Engine, ExecutableType } from '../../core'

export const testContracts: Contract[] = [{
  id: 'testContract',
  address: 'testContract',
  bundle: {
    executable: Buffer.from(''),
    meta: {
      engine: Engine.plutus,
      executableType: ExecutableType.js,
      hash: 'abcd'
    },
    schema: ''
  }
}]
