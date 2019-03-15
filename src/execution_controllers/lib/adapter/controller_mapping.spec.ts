import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import { contractExecutionAdapter, SmartContractEngine } from './index'
import * as externalActions from './external'
import { solidityExecutionController } from '../controllers'
use(chaiAsPromised)

describe('controllerMapping', () => {
  let sandbox: sinon.SinonSandbox
  let requestSignatureStub: sinon.SinonStub
  const web3Mock = { mock: true }

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    sandbox.stub(externalActions, 'initializeWeb3Instance').returns(web3Mock)
    requestSignatureStub = sandbox.stub(externalActions, 'requestSignature').returns(Promise.resolve({}))
    sandbox.stub(externalActions, 'publishNewContract').returns(Promise.resolve({}))
  })

  afterEach(() => sandbox.restore())

  describe('readContract', () => {
    it('passes the correct arguments to the ExecutionController for Solidity', async () => {
      const callStub = sandbox.stub(solidityExecutionController, 'call')

      const readContractArguments = {
        engine: SmartContractEngine.solidity,
        method: 'balanceOf',
        contractAddress: '0xABC',
        contractCode: '--move',
        methodArguments: ['0x532']
      }

      const opts = { web3Provider: 'local' }

      await contractExecutionAdapter.readContract(readContractArguments, opts)
      expect(callStub.callCount).to.eql(1)
      expect(callStub.calledWithExactly(readContractArguments, web3Mock)).to.eql(true)
    })

    it('throws an error if the language is not supported', async () => {
      const readContractArguments = {
        engine: 'invalidEngine' as SmartContractEngine,
        method: 'balanceOf',
        contractAddress: '0xABC',
        contractCode: '--move',
        methodArguments: ['0x532']
      }

      const opts = { web3Provider: 'local' }

      expect(() => contractExecutionAdapter.readContract(readContractArguments, opts))
        .to.throw(/Engine unsupported/)
    })
  })

  describe('executeContract', () => {
    it('passes the correct arguments to the ExecutionController for Solidity', async () => {
      const executionReturnMock = {
        to: '0xAB',
        data: '0xBC',
        from: '0xCD',
        gas: 100
      }

      const executeStub = sandbox.stub(solidityExecutionController, 'execute').returns(Promise.resolve(executionReturnMock))

      const executeContractArguments = {
        engine: SmartContractEngine.solidity,
        method: 'transfer',
        contractAddress: '0xABC',
        contractCode: '--move',
        methodArguments: ['0x532', 10],
        originatorPk: '0x54'
      }

      const opts = { web3Provider: 'local', cardanoClientProxiUri: 'remote' }

      await contractExecutionAdapter.executeContract(executeContractArguments, opts)
      expect(executeStub.callCount).to.eql(1)
      expect(requestSignatureStub.callCount).to.eql(1)
      expect(executeStub.calledWithExactly(executeContractArguments, web3Mock)).to.eql(true)
      expect(requestSignatureStub.calledWithExactly({ publicKey: '0x54', transaction: executionReturnMock }, 'remote')).to.eql(true)
    })

    it('throws an error if the language is not supported', async () => {
      const executeContractArguments = {
        engine: 'invalidEngine' as SmartContractEngine,
        method: 'transfer',
        contractAddress: '0xABC',
        contractCode: '--move',
        methodArguments: ['0x532', 10]
      }

      const opts = { web3Provider: 'local' }
      const invalidExecution = contractExecutionAdapter.executeContract(executeContractArguments, opts)
      await expect(invalidExecution).to.eventually.be.rejectedWith(/Engine unsupported/)
    })
  })

  describe('submitSignedTransaction', () => {
    it('passes the correct arguments to the ExecutionController for Solidity', async () => {
      const submitStub = sandbox.stub(solidityExecutionController, 'submit')

      const submitArgs = {
        signedTransaction: 'signature',
        engine: SmartContractEngine.solidity
      }

      const opts = { web3Provider: 'local' }

      await contractExecutionAdapter.submitSignedTransaction(submitArgs, opts)
      expect(submitStub.callCount).to.eql(1)
      expect(submitStub.calledWithExactly('signature', web3Mock)).to.eql(true)
    })

    it('throws an error if the language is not supported', async () => {
      const submitArgs = {
        signedTransaction: 'signature',
        engine: 'invalidEngine' as SmartContractEngine
      }

      const opts = { web3Provider: 'local' }

      expect(() => contractExecutionAdapter.submitSignedTransaction(submitArgs, opts))
        .to.throw(/Engine unsupported/)
    })
  })
})
