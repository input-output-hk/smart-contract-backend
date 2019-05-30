import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import { SolidityEngineClient } from './SolidityEngineClient'
import { testContracts } from '../../../test'

use(chaiAsPromised)

describe('SolidityEngineClient', () => {
  let engine: ReturnType<typeof SolidityEngineClient>
  let sandbox: sinon.SinonSandbox
  const testContract = testContracts[0]
  const { address: contractAddress, executable } = testContract
  const contractMock = {
    methods: {
      callMethod: (_?: any) => ({
        call: (): Promise<undefined> => Promise.resolve(undefined)
      }),
      executeMethod: (_a?: any, _b?: any): any => {
        return {
          encodeABI: (): undefined => undefined,
          estimateGas: (): Promise<undefined> => Promise.resolve(undefined)
        }
      }
    }
  }

  const web3Mock = {
    eth: {
      Contract: () => contractMock,
      sendSignedTransaction: () => Promise.resolve(true)
    }
  }

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    engine = await SolidityEngineClient({ web3: web3Mock })
  })

  afterEach(() => sandbox.restore())

  describe('loadExecutable', () => {
    let spy: sinon.SinonSpy
    beforeEach(async () => {
      spy = sandbox.spy(web3Mock.eth, 'Contract')
    })
    it('caches the contract', async () => {
      await engine.loadExecutable({ contractAddress, executable })
      expect(spy.callCount).to.eql(1)
      expect(spy.calledWithExactly(executable, contractAddress)).to.eql(true)
      await engine.loadExecutable({ contractAddress, executable })
      expect(spy.callCount).to.eql(1)
    })
  })
  describe('unloadExecutable', () => {
    let spy: sinon.SinonSpy
    beforeEach(async () => {
      spy = sandbox.spy(web3Mock.eth, 'Contract')
      await engine.loadExecutable({ contractAddress, executable })
      expect(spy.callCount).to.eql(1)
    })
    it('removes the contract from the cache', async () => {
      await engine.unloadExecutable(contractAddress)
      await engine.loadExecutable({ contractAddress, executable })
      expect(spy.callCount).to.eql(2)
    })
    it('is idempotent', async () => {
      await engine.unloadExecutable(contractAddress)
      await engine.unloadExecutable(contractAddress)
      await engine.loadExecutable({ contractAddress, executable })
      expect(spy.callCount).to.eql(2)
    })
  })
  describe('call', () => {
    let spy: sinon.SinonSpy
    beforeEach(async () => {
      spy = sandbox.spy(contractMock.methods, 'callMethod')
      await engine.loadExecutable({ contractAddress, executable })
    })
    it('calls the web3 method with no arguments if none are provided', async () => {
      engine.call({ contractAddress, method: 'callMethod' })
      expect(spy.callCount).to.eql(1)
      expect(spy.calledWithExactly()).to.eql(true)
    })
    it('calls the web3 method with arguments when provided', async () => {
      const methodArguments = [1, 'location']
      engine.call({ contractAddress, method: 'callMethod', methodArguments })
      expect(spy.callCount).to.eql(1)
      expect(spy.calledWithExactly(methodArguments)).to.eql(true)
    })
  })
  describe('execute', () => {
    let spy: sinon.SinonSpy
    beforeEach(async () => {
      spy = sandbox.spy(contractMock.methods, 'executeMethod')
      await engine.loadExecutable({ contractAddress, executable })
    })
    it('invokes the web3 method with no arguments if none are provided', async () => {
      engine.execute({ contractAddress, method: 'executeMethod', originatorPk: 'some-pk' })
      expect(spy.callCount).to.eql(1)
      expect(spy.calledWithExactly()).to.eql(true)
    })
    it('invokes the web3 method with arguments when provided', async () => {
      const methodArguments = [1, 'location']
      engine.execute({ contractAddress, method: 'executeMethod', methodArguments })
      expect(spy.callCount).to.eql(1)
      expect(spy.calledWithExactly(methodArguments)).to.eql(true)
    })
  })
  describe('submitSignedTransaction', () => {
    let spy: sinon.SinonSpy
    beforeEach(async () => {
      spy = sandbox.spy(web3Mock.eth, 'sendSignedTransaction')
    })
    it('sends the transaction to the network', async () => {
      const signedTransaction = 'some-signed-transaction'
      await engine.submitSignedTransaction(signedTransaction)
      expect(spy.callCount).to.eql(1)
      expect(spy.calledWithExactly(signedTransaction)).to.eql(true)
    })
  })
})
