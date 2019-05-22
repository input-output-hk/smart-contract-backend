import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import NodeEngine from './index'
import { ContractNotLoaded, BadArgument, ExecutionFailure } from '../errors'
import { Engines } from '../Engine'
use(chaiAsPromised)

describe('NodeEngine', () => {
  const mockModule = '{ "foobar": "(args) => args.a + args.b" }'
  const mockAddress = 'abcd'

  beforeEach(() => {
    process.env.ENGINE = Engines.nodejs
  })

  afterEach(async () => {
    process.env.ENGINE = ''
    await NodeEngine.unload({ contractAddress: mockAddress })
  })

  describe('load', () => {
    it('returns true after loading a module', async () => {
      const res = await NodeEngine.load({ contractAddress: mockAddress, executable: mockModule })
      expect(res).to.eql(true)
    })
  })

  describe('unload', () => {
    it('returns true after unloading a module', async () => {
      const res = await NodeEngine.unload({ contractAddress: mockAddress })
      expect(res).to.eql(true)
    })
  })

  describe('execute', () => {
    it('throws if the contract is not loaded', () => {
      const res = NodeEngine.execute({ contractAddress: mockAddress, method: 'foobar', methodArgs: { a: 1, b: 2 } })
      return expect(res).to.eventually.be.rejectedWith(ContractNotLoaded)
    })

    it('throws if method arguments are of the wrong type', async () => {
      await NodeEngine.load({ contractAddress: mockAddress, executable: mockModule })
      const res = NodeEngine.execute({ contractAddress: mockAddress, method: 'foobar', methodArgs: 1 })
      return expect(res).to.eventually.be.rejectedWith(BadArgument)
    })

    it('throws if the contract does not have the specified method', async () => {
      await NodeEngine.load({ contractAddress: mockAddress, executable: mockModule })
      const res = NodeEngine.execute({ contractAddress: mockAddress, method: 'foobaz', methodArgs: { a: 1, b: 2 } })
      return expect(res).to.eventually.be.rejectedWith(ExecutionFailure)
    })

    it('executes the specified method and returns the result', async () => {
      await NodeEngine.load({ contractAddress: mockAddress, executable: mockModule })
      const res = await NodeEngine.execute({ contractAddress: mockAddress, method: 'foobar', methodArgs: { a: 1, b: 2 } })
      expect(res).to.eql(3)
    })
  })
})
