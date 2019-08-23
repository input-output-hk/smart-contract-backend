import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { Contract, Engine, PortAllocation } from '../../core'
import { InMemoryRepository, Repository } from '../../lib'
import { testContracts, checkPortIsFree } from '../../lib/test'
import { Client } from '../../client'
import { Server } from '.'
import { StubEngineClient } from '../infrastructure'
const nock = require('nock')

use(chaiAsPromised)

describe('Server', () => {
  let server: ReturnType<typeof Server>
  let portAllocationRepository: Repository<PortAllocation>
  const executionEndpoint = 'http://execution'
  const API_PORT = 8081
  const client = Client({
    apiUri: `http://localhost:${API_PORT}`,
    subscriptionUri: `ws://localhost:${API_PORT}`,
    transactionHandler: () => {}
  })
  const testContract = testContracts[0]

  beforeEach(async () => {
    await checkPortIsFree(8082)
    portAllocationRepository = InMemoryRepository<PortAllocation>()
    server = Server({
      apiPort: API_PORT,
      contractRepository: InMemoryRepository<Contract>(),
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient()
      ]]),
      pubSubClient: new PubSub()
    })
    await client.connect('abc')
    nock(executionEndpoint)
      .post()
      .reply(200, { data: {} })

    nock(testContract.location)
      .get('/')
      .reply(200, testContract.bundle)
  })

  afterEach(() => nock.cleanAll())

  describe('Boot', () => {
    beforeEach(async () => server.boot())
    afterEach(async () => server.shutdown())

    it('Starts the API server', async () => {
      expect((await checkServer(API_PORT)).statusText).to.eq('OK')
      expect((await client.schema()).__schema).to.exist
      expect((await client.contracts()).length).to.eq(0)
    })
  })

  describe('Shutdown', () => {
    beforeEach(async () => {
      await server.boot()
      expect((await client.contracts()).length).to.eq(0)
      await client.loadContract(testContract)
      expect((await client.contracts()).length).to.eq(1)
    })

    it('Closes the API server and loaded contract API servers', async () => {
      const contractPort = (await portAllocationRepository.getLast()).portNumber
      expect((await checkServer(contractPort)).statusText).to.eq('OK')
      expect((await checkServer(API_PORT)).statusText).to.eq('OK')
      await server.shutdown()
      await expect(checkServer(API_PORT)).to.be.rejected
      await expect(checkServer(contractPort)).to.be.rejected
    })
  })
})

function checkServer (port: number) {
  return axios({
    url: `http://localhost:${port}/graphql`,
    method: 'post',
    data: { query: `{ __schema { types { name } } }` }
  })
}
