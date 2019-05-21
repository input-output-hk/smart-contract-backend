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
  const SERVICE_API_PORT = 8079
  const API_PORT = 8081
  let apiClient: ReturnType<typeof ServiceApiClient>
  const testContract = testContracts[0]

  beforeEach(() => {
    portAllocationRepository = InMemoryRepository<PortAllocation>()
    const pubSubClient = new PubSub()
    server = Server({
      serviceApi: { port: SERVICE_API_PORT },
      contractProxy: { port: API_PORT },
      contractRepository: InMemoryRepository<Contract>(),
      portManagerConfig: {
        repository: portAllocationRepository,
        range: {
          lower: 8082,
          upper: 8900
        }
      },
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient(pubSubClient)
      ]]),
      bundleFetcher: HttpTarGzBundleFetcher(networkInterface),
      pubSubClient
    })
    apiClient = ServiceApiClient(SERVICE_API_PORT)
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

    it('Exposes the service API and contract proxy', async () => {
      const proxyResponse = await axios.get(`http://localhost:${API_PORT}/.well-known/apollo/server-health`)
      expect(proxyResponse.statusText).to.eq('OK')
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

    it('Closes the service API, contract proxy, and loaded contract servers', async () => {
      const contractPort = (await portAllocationRepository.getLast()).portNumber
      await server.shutdown()
      await expect(axios.get(`http://localhost:${contractPort}`)).to.be.rejected
      await expect(axios.get(`http://localhost:${API_PORT}/.well-known/apollo/server-health`)).to.be.rejected
      await expect(apiClient.schema()).to.rejected
    })
  })
})
