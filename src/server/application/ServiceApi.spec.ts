import { expect, use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import http from 'http'
import { HttpLink } from 'apollo-link-http'
import { PubSub } from 'apollo-server'
import fetch from 'cross-fetch'
import { execute, GraphQLRequest, makePromise } from 'apollo-link'
import { Contract, Engine, PortAllocation } from '../core'
import {
  ServiceApi,
  ContractApiServerController,
  ContractController,
  PortManager } from './'
import { PortAllocationRepository } from './lib/PortAllocationRepository'
import { close } from '../lib/http'
import { InMemoryRepository } from '../infrastructure/repositories'
import { HttpTarGzBundleFetcher } from '../infrastructure/bundle_fetcher'
import { StubEngineClient } from '../infrastructure/engine_clients'
import { testContract, ServiceApiClient } from './test'
import gql from 'graphql-tag'
const nock = require('nock')

use(chaiAsPromised)

describe('ServiceApi', () => {
  let serviceApi: ReturnType<typeof ServiceApi>
  let serviceApiHttpServer: http.Server
  let apiClient: ReturnType<typeof ServiceApiClient>
  let portAllocationRepository: PortAllocationRepository
  const API_PORT = 8079
  const executionEndpoint = 'http://execution'
  const networkInterface = axios.create()

  beforeEach(async () => {
    const contractRepository = InMemoryRepository<Contract>()
    portAllocationRepository = InMemoryRepository<PortAllocation>()
    serviceApi = ServiceApi({
      contractController: ContractController({
        apiServerController: ContractApiServerController(PortManager({
          repository: portAllocationRepository,
          range: {
            lower: 8080,
            upper: 8082
          }
        })),
        contractRepository,
        bundleFetcher: HttpTarGzBundleFetcher(networkInterface),
        engineClients: new Map([[
          Engine.stub,
          StubEngineClient()
        ]])
      }),
      contractRepository,
      pubSubClient: new PubSub()

    })
    serviceApiHttpServer = await serviceApi.listen(API_PORT)
    apiClient = ServiceApiClient(API_PORT)
    nock(executionEndpoint)
      .post()
      .reply(200, { data: {} })

    nock(testContract.location)
      .get('/')
      .reply(200, testContract.bundle)
  })

  afterEach(async () => {
    await close(serviceApiHttpServer)
    nock.cleanAll()
  })

  describe('contracts', () => {
    it('returns an empty array if there are no contracts loaded', async () => {
      expect(await apiClient.contracts()).to.be.eql([])
    })
    it('returns an array of loaded contracts', async () => {
      await apiClient.loadContract(testContract)
      expect(await apiClient.contracts()).to.be.eql([{
        engine: Engine.stub,
        contractAddress: testContract.address
      }])
    })
  })
  describe('loadContract', () => {
    it('fetches the contract bundle, loads the executable, and creates a GraphQL server as the API', async () => {
      await apiClient.loadContract(testContract)
      expect(await apiClient.contracts()).to.eql([{
        engine: Engine.stub,
        contractAddress: testContract.address
      }])
      const allocatedPort = (await portAllocationRepository.getLast()).portNumber
      const link = new HttpLink({ uri: `http://localhost:${allocatedPort}/graphql`, fetch })
      const operation: GraphQLRequest = {
        query: gql`query {
            stub
        }`
      }
      expect((await makePromise(execute(link, operation))).data.stub).to.eql(true)
    })
    it('throws an error if the bundle is not available', async () => {
      await expect(apiClient.loadContract({ address: testContract.address, location: 'invalid-location' })).to.be.rejected
    })
  })
})
