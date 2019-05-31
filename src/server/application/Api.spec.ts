import { expect } from 'chai'
import * as http from 'http'
import * as express from 'express'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { Engine, PortAllocation } from '../../core'
import { expressEventPromiseHandler, httpEventPromiseHandler, PortMapper } from '../../lib'
import { HttpTarGzBundleFetcher, InMemoryRepository, StubEngineClient } from '../infrastructure'
import { Api, ContractApiServerController, ContractController } from '.'

import { checkPortIsFree, populatedContractRepository } from '../test'
const nock = require('nock')

describe('Api', () => {
  let api: ReturnType<typeof Api>
  let apiServer: http.Server
  let testContractServer: http.Server
  const API_PORT = 8081
  const API_URI = `http://localhost:${API_PORT}`

  beforeEach(async () => {
    await checkPortIsFree(8082)
    const pubSubClient = new PubSub()
    const contractRepository = await populatedContractRepository()
    const apiServerController = ContractApiServerController(PortMapper({
      repository: InMemoryRepository<PortAllocation>(),
      range: { lower: 8082, upper: 8084 }
    }))
    const contractController = ContractController({
      contractRepository,
      bundleFetcher: HttpTarGzBundleFetcher(axios.create()),
      apiServerController,
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient()
      ]]),
      pubSubClient
    })
    api = Api({
      contractController,
      contractRepository,
      apiServerController,
      pubSubClient
    })

    apiServer = await expressEventPromiseHandler.listen(api.app, API_PORT)
    const testContractApp = express()
    testContractServer = await expressEventPromiseHandler.listen(testContractApp, 8082)
    apiServerController.servers.set('abcd', testContractServer)
    nock('http://localhost:8082')
      .get('/graphql/')
      .reply(200, { id: 'abcd' })
  })

  afterEach(async () => {
    await httpEventPromiseHandler.close(apiServer)
    await httpEventPromiseHandler.close(testContractServer)
    return nock.cleanAll()
  })

  it('proxies contract requests to the individual contract API servers', async () => {
    const response = await axios.get(`${API_URI}/contract/abcd`)
    expect(response.status).to.eq(200)
  })

  it('has a health check endpoint', async () => {
    const response = await axios.get(`${API_URI}/.well-known/apollo/server-health`)
    expect(response.status).to.eq(200)
    expect(response.data).to.eql({ status: 'pass' })
  })
})
