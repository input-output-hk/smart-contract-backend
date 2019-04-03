import { expect, use } from 'chai'
import * as engine from './plutus'
import { SmartContractEngine } from '../adapter'
import * as chaiAsPromised from 'chai-as-promised'
const nock = require('nock')

use(chaiAsPromised)

describe('plutusEngineExecutor', () => {
  const walletEndpoint = 'http://walletEndpoint'
  const executionEndpoint = 'http://executionEndpoint'

  beforeEach(() => {
    nock(walletEndpoint)
      .post('/transaction/submitSignedTransaction')
      .reply(201, { submit: true })

    nock(executionEndpoint)
      .post('/execute/abcd/add')
      .reply(201, { execute: true })
  })

  afterEach(() => nock.cleanAll())

  describe('call', () => {
    it('throws an implementation error', async () => {
      const call = engine.plutusExecutionController.call({
        contractAddress: 'abcd',
        engine: SmartContractEngine.plutus,
        method: 'callMethod'
      }, executionEndpoint)

      await expect(call).to.eventually.be.rejectedWith(/Plutus engine does not yet support state calls/)
    })
  })

  describe('execute', () => {
    it('forwards execution to the engine', async () => {
      const executionResult = await engine.plutusExecutionController.execute({
        contractAddress: 'abcd',
        engine: SmartContractEngine.plutus,
        method: 'add',
        methodArguments: { number1: 5, number2: 10 }
      }, executionEndpoint)

      expect(executionResult.execute).to.eql(true)
    })
  })

  describe('submit', () => {
    it('forwards submission to the wallet API', async () => {
      const submitResult = await engine.plutusExecutionController.submit('signedTxData', walletEndpoint)
      expect(submitResult.submit).to.eql(true)
    })
  })
})
