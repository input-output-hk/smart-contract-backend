import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { Contract, Engine } from '../../core'
import { InMemoryRepository } from '../../lib'
import { checkPortIsFree } from '../../lib/test'
import { Client } from '../../client'
import { Server } from '.'
import { StubEngineClient } from '../infrastructure'

use(chaiAsPromised)

describe('Server', () => {
  let server: ReturnType<typeof Server>
  const API_PORT = 8081
  const client = Client({
    apiUri: `http://localhost:${API_PORT}`,
    subscriptionUri: `ws://localhost:${API_PORT}`,
    transactionHandler: () => { }
  })

  const testContractAddress = 'abcd'

  beforeEach(async () => {
    await checkPortIsFree(8082)
    server = Server({
      apiPort: API_PORT,
      contractDirectory: 'test/bundles/nodejs',
      contractRepository: InMemoryRepository<Contract>(),
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient()
      ]]),
      pubSubClient: new PubSub()
    })
    await client.connect('abc')
  })

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
      await client.loadContract(testContractAddress, Engine.stub)
      expect((await client.contracts()).length).to.eq(1)
    })

    it('Closes the API server and loaded contracts', async () => {
      await server.shutdown()
      await expect(checkServer(API_PORT)).to.eventually.be.rejected
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
