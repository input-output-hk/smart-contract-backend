import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import NodeEngine from './index'
use(chaiAsPromised)

describe('NodeEngine', () => {
  const mockModule = 'module.exports = { foobar: (a, b) => a + b }'
  const mockAddress = 'abcd'

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

    })

    it('throws if the contract does not have the specified method', () => {

    })

    it('executes the specified method and returns the result', () => {

    })
  })
})