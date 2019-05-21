import { expect } from 'chai'
import * as http from 'http'
import { listen, close } from '../lib/http'
import { InMemoryRepository } from '../infrastructure'
import { PortAllocation } from '../core'
import axios from 'axios'
import { ContractProxy } from './ContractProxy'
import { ContractApiServerController } from './ContractApiServerController'
import { PortManager } from './PortManager'
const nock = require('nock')

describe('ContractProxy', () => {
  let contractProxy: ReturnType<typeof ContractProxy>
  let server: http.Server
  const catchAllUri = 'http://localhost:8079'
  const API_PORT = 8081

  beforeEach(async () => {
    const apiServerController = ContractApiServerController(
      PortManager({
        repository: InMemoryRepository<PortAllocation>(),
        range: { lower: 8082, upper: 8084 }
      })
    )
    server = http.createServer()
    await listen(server, 8082)
    apiServerController.servers.set('abcd', server)
    contractProxy = ContractProxy({
      apiServerController,
      catchAllUri
    })
    await listen(contractProxy, API_PORT)
    nock(catchAllUri)
      .get('/.well-known/apollo/server-health')
      .reply(200, { id: 'catchAll' })
    nock(`http://localhost:8082/`)
      .get('/abcd')
      .reply(200, { id: 'abcd' })
  })

  afterEach(async () => {
    await close(server)
    await close(contractProxy)
    return nock.cleanAll()
  })

  it('Routes requests to the contract API server', async () => {
    const proxyResponse = await axios.get(`http://localhost:${API_PORT}/abcd`)
    expect(proxyResponse.status).to.eq(200)
    expect(proxyResponse.data).to.eql({ id: 'abcd' })
  })

  it('Routes to a catchall address if no contract is found', async () => {
    const proxyResponse = await axios.get(`http://localhost:${API_PORT}/.well-known/apollo/server-health`)
    expect(proxyResponse.status).to.eq(200)
    expect(proxyResponse.data).to.eql({ id: 'catchAll' })
  })
})
