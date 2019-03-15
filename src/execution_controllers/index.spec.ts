import { expect } from 'chai'
import * as sinon from 'sinon'
import { ContractExecution } from '.'
import { contractExecutionAdapter, SmartContractEngine } from './lib/adapter'

describe('ContractExecution', () => {
  let sandbox: sinon.SinonSandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  it('publishNewContract calls the associated adapter method with the right arguments', async () => {
    const stub = sandbox.stub(contractExecutionAdapter, 'publishNewContract')

    const cardanoClientProxiUri = 'local'
    const executorInstance = new ContractExecution({ cardanoClientProxiUri })
    const publishNewContractArguments = {
      engine: SmartContractEngine.solidity,
      contractCode: '--move',
      address: '0xABC',
      name: 'Token'
    }

    await executorInstance.publishNewContract(publishNewContractArguments)
    expect(stub.calledWith(publishNewContractArguments, cardanoClientProxiUri)).to.eql(true)
  })

  it('readContract calls the associated adapter method with the right arguments', async () => {
    const stub = sandbox.stub(contractExecutionAdapter, 'readContract')

    const executionOptions = { cardanoClientProxiUri: 'local', web3Provider: 'remote-eth' }
    const executorInstance = new ContractExecution(executionOptions)
    const readContractArguments = {
      engine: SmartContractEngine.solidity,
      method: 'balanceOf',
      contractAddress: '0xABC',
      contractCode: '--move',
      methodArguments: ['0x532']
    }

    await executorInstance.readContract(readContractArguments)
    expect(stub.calledWith(readContractArguments, executionOptions)).to.eql(true)
  })

  it('executeContract calls the associated adapter method with the right arguments', async () => {
    const stub = sinon.stub(contractExecutionAdapter, 'executeContract')

    const executionOptions = { cardanoClientProxiUri: 'local', web3Provider: 'remote-eth' }
    const executorInstance = new ContractExecution(executionOptions)
    const executeContractArguments = {
      engine: SmartContractEngine.solidity,
      method: 'balanceOf',
      contractAddress: '0xABC',
      contractCode: '--move',
      methodArguments: ['0x532']
    }

    await executorInstance.executeContract(executeContractArguments)
    expect(stub.calledWith(executeContractArguments, executionOptions)).to.eql(true)
  })

  it('submitSignedTransaction calls the associated adapter method with the right arguments', async () => {
    const stub = sinon.stub(contractExecutionAdapter, 'submitSignedTransaction')

    const executionOptions = { cardanoClientProxiUri: 'local', web3Provider: 'remote-eth' }
    const executorInstance = new ContractExecution(executionOptions)
    const submitSignedTransactionArguments = {
      engine: SmartContractEngine.solidity,
      signedTransaction: 'transactionSignature'
    }

    await executorInstance.submitSignedTransaction(submitSignedTransactionArguments)
    expect(stub.calledWith(submitSignedTransactionArguments, executionOptions)).to.eql(true)
  })
})
