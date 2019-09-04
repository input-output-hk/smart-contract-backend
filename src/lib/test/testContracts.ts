import { Contract, Engine } from '../../core'

export const testContracts: Contract[] = [{
  id: 'testContract',
  address: 'testContract',
  engine: Engine.plutus,
  bundle: {
    executable: Buffer.from(''),
    schema: ''
  }
}]
