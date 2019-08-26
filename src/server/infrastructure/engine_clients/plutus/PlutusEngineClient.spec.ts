import { expect, use } from 'chai'
import axios from 'axios'
import * as chaiAsPromised from 'chai-as-promised'
import { PlutusEngineClient } from './PlutusEngineClient'
import { testContracts } from '../../../../lib/test'
const nock = require('nock')

use(chaiAsPromised)

describe('PlutusEngineClient', () => {
  let engine: ReturnType<typeof PlutusEngineClient>
  const executionEndpoint = 'http://execution'
  const testContract = testContracts[0]

  beforeEach(async () => {
    engine = await PlutusEngineClient({
      executionEndpoint,
      networkInterface: axios.create()
    })

    nock(executionEndpoint)
      .post('/loadSmartContract')
      .reply(204)

    nock(executionEndpoint)
      .post('/unloadSmartContract')
      .reply(204)

    nock(executionEndpoint)
      .post(`/execute/${testContract.address}/add`)
      .reply(201)
  })

  afterEach(() => nock.cleanAll())

  describe('loadExecutable', () => {
    it('calls the execution service HTTP API with the executable', async () => {
      const { address: contractAddress, bundle: { executable } } = testContract
      const load = await engine.loadExecutable({ contractAddress, executable })
      expect(load.status).to.eq(204)
    })
  })
  describe('unloadExecutable', () => {
    it('calls the execution service HTTP API with the contract address', async () => {
      const unload = await engine.unloadExecutable(testContract.address)
      expect(unload.status).to.eq(204)
    })
  })
  describe('call', () => {
    it('calls the execution service API with the method arguments', async () => {
      const response = await engine.call({
        contractAddress: testContract.address,
        method: 'add',
        methodArguments: { number1: 5, number2: 10 }
      })
      expect(response.status).to.eq(201)
    })
  })
})
