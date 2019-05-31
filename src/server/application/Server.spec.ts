import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { Contract, Engine, PortAllocation } from '../core'
import { Server } from '.'
import { Repository } from './lib/Repository'
import { InMemoryRepository, HttpTarGzBundleFetcher, StubEngineClient } from '../infrastructure'
import { ServiceApiClient, testContracts } from '../test'
const nock = require('nock')

use(chaiAsPromised)

describe('Server', () => {
  let server: ReturnType<typeof Server>
  let portAllocationRepository: Repository<PortAllocation>
  const networkInterface = axios.create()
  const executionEndpoint = 'http://execution'
  const API_PORT = 8081
  let apiClient: ReturnType<typeof ServiceApiClient>
  const testContract = testContracts[0]

  beforeEach(() => {
    portAllocationRepository = InMemoryRepository<PortAllocation>()
    server = Server({
      apiPort: API_PORT,
      contractRepository: InMemoryRepository<Contract>(),
      portMapperConfig: {
        repository: portAllocationRepository,
        range: {
          lower: 8082,
          upper: 8900
        }
      },
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient()
      ]]),
      bundleFetcher: HttpTarGzBundleFetcher(networkInterface),
      pubSubClient: new PubSub()
    })
    apiClient = ServiceApiClient(API_PORT)
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
      expect((await apiClient.schema()).__schema).to.exist
      expect((await apiClient.contracts()).length).to.eq(0)
    })
  })

  describe('Shutdown', () => {
    beforeEach(async () => {
      await server.boot()
      expect((await apiClient.contracts()).length).to.eq(0)
      await apiClient.loadContract(testContract)
      expect((await apiClient.contracts()).length).to.eq(1)
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
