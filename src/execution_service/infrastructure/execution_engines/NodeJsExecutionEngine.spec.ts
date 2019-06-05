import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { NodeJsExecutionEngine } from './NodeJsExecutionEngine'
import { ContractNotLoaded, BadArgument, ExecutionFailure } from '../../errors'
use(chaiAsPromised)

describe('NodeJsExecutionEngine', () => {
  const mockModule = '{ foobar: (args) => args.a + args.b }'
  const mockAddress = 'abcd'

  afterEach(async () => {
    await NodeJsExecutionEngine.unload({ contractAddress: mockAddress })
  })

  describe('load', () => {
    it('returns true after loading a module', async () => {
      const res = await NodeJsExecutionEngine.load({ contractAddress: mockAddress, executable: mockModule })
      expect(res).to.eql(true)
    })
  })

  describe('unload', () => {
    it('returns true after unloading a module', async () => {
      const res = await NodeJsExecutionEngine.unload({ contractAddress: mockAddress })
      expect(res).to.eql(true)
    })
  })

  describe('execute', () => {
    it('throws if the contract is not loaded', () => {
      const res = NodeJsExecutionEngine.execute({ contractAddress: mockAddress, method: 'foobar', methodArgs: { a: 1, b: 2 } })
      return expect(res).to.eventually.be.rejectedWith(ContractNotLoaded)
    })

    it('throws if method arguments are of the wrong type', async () => {
      await NodeJsExecutionEngine.load({ contractAddress: mockAddress, executable: mockModule })
      const res = NodeJsExecutionEngine.execute({ contractAddress: mockAddress, method: 'foobar', methodArgs: 1 })
      return expect(res).to.eventually.be.rejectedWith(BadArgument)
    })

    it('throws if the contract does not have the specified method', async () => {
      await NodeJsExecutionEngine.load({ contractAddress: mockAddress, executable: mockModule })
      const res = NodeJsExecutionEngine.execute({ contractAddress: mockAddress, method: 'foobaz', methodArgs: { a: 1, b: 2 } })
      return expect(res).to.eventually.be.rejectedWith(ExecutionFailure)
    })

    it('executes the specified method and returns the result', async () => {
      await NodeJsExecutionEngine.load({ contractAddress: mockAddress, executable: mockModule })
      const res = await NodeJsExecutionEngine.execute({ contractAddress: mockAddress, method: 'foobar', methodArgs: { a: 1, b: 2 } })
      expect(res).to.eql({ data: 3 })
    })
  })
})
