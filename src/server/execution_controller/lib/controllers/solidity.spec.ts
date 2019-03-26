import { expect } from 'chai'
import * as sinon from 'sinon'
import * as engine from './solidity'
import { SmartContractEngine } from '../adapter'

describe('solidityEngineExecutor', () => {
  let sandbox: sinon.SinonSandbox
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
      Contract: () => contractMock
    }
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('call', () => {
    it('calls the web3 method with no arguments if none are provided', async () => {
      const callSpy = sandbox.spy(contractMock.methods, 'callMethod')

      await engine.solidityExecutionController.call({
        contractAddress: '0xAB',
        contractCode: '[{}]',
        engine: SmartContractEngine.solidity,
        method: 'callMethod'
      }, web3Mock)

      expect(callSpy.callCount).to.eql(1)
      expect(callSpy.calledWithExactly()).to.eql(true)
    })

    it('calls the web3 method with arguments when provided', async () => {
      const callSpy = sandbox.spy(contractMock.methods, 'callMethod')
      const methodArguments = [1, 'location']

      await engine.solidityExecutionController.call({
        contractAddress: '0xAB',
        contractCode: '[{}]',
        engine: SmartContractEngine.solidity,
        method: 'callMethod',
        methodArguments
      }, web3Mock)

      expect(callSpy.callCount).to.eql(1)
      expect(callSpy.calledWithExactly(methodArguments)).to.eql(true)
    })
  })

  describe('execute', () => {
    it('invokes the web3 method with no arguments if none are provided', async () => {
      const executeSpy = sandbox.spy(contractMock.methods, 'executeMethod')

      await engine.solidityExecutionController.execute({
        contractAddress: '0xAB',
        contractCode: '[{}]',
        engine: SmartContractEngine.solidity,
        method: 'executeMethod'
      }, web3Mock)

      expect(executeSpy.callCount).to.eql(1)
      expect(executeSpy.calledWithExactly()).to.eql(true)
    })

    it('invokes the web3 method with arguments when they are provided', async () => {
      const executeSpy = sandbox.spy(contractMock.methods, 'executeMethod')

      await engine.solidityExecutionController.execute({
        contractAddress: '0xAB',
        contractCode: '[{}]',
        engine: SmartContractEngine.solidity,
        method: 'executeMethod'
      }, web3Mock)

      expect(executeSpy.callCount).to.eql(1)
      expect(executeSpy.calledWithExactly()).to.eql(true)
    })
  })
})
