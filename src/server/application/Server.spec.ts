import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { Server } from './Server'
import { InMemoryRepository } from '../infrastructure/repositories'
import { HttpTarGzBundleFetcher } from '../infrastructure/bundle_fetcher'
import { Contract, Engine, PortAllocation } from '../core'
import { StubEngineClient } from '../infrastructure/engine_clients'
import { testContract } from './test'
import { Repository } from './lib/Repository'
import { ServiceApiClient } from './test/ServiceApiClient'
const nock = require('nock')

use(chaiAsPromised)

describe('Server', () => {
  let server: ReturnType<typeof Server>
  let portAllocationRepository: Repository<PortAllocation>
  const networkInterface = axios.create()
  const executionEndpoint = 'http://execution'
  const API_PORT = 8079
  const CONTRACT_PROXY_PORT = 8081
  let apiClient: ReturnType<typeof ServiceApiClient>

  beforeEach(() => {
    portAllocationRepository = InMemoryRepository<PortAllocation>()
    server = Server({
      serviceApi: { port: API_PORT },
      contractProxy: { port: CONTRACT_PROXY_PORT },
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
        StubEngineClient()
      ]]),
      bundleFetcher: HttpTarGzBundleFetcher(networkInterface)
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

    it('Exposes the service API and contract proxy', async () => {
      const proxyResponse = await axios.get(`http://localhost:${CONTRACT_PROXY_PORT}/.well-known/apollo/server-health`)
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
      await expect(axios.get(`http://localhost:${CONTRACT_PROXY_PORT}/.well-known/apollo/server-health`)).to.be.rejected
      await expect(apiClient.schema()).to.rejected
    })
  })
})