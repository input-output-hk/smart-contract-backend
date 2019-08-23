import { expect } from 'chai'
import * as http from 'http'
import axios from 'axios'
import { PubSub } from 'apollo-server'
import { Engine } from '../../core'
import { expressEventPromiseHandler, httpEventPromiseHandler } from '../../lib'
import { checkPortIsFree, populatedContractRepository } from '../../lib/test'
import { StubEngineClient } from '../infrastructure'
import { Api, ContractController } from '.'

describe('Api', () => {
  let api: ReturnType<typeof Api>
  let apiServer: http.Server
  const API_PORT = 8081
  const API_URI = `http://localhost:${API_PORT}`

  beforeEach(async () => {
    await checkPortIsFree(8082)
    const pubSubClient = new PubSub()
    const contractRepository = await populatedContractRepository()
    const contractController = ContractController({
      contractRepository,
      engineClients: new Map([[
        Engine.stub,
        StubEngineClient()
      ]]),
      pubSubClient
    })
    api = Api({
      contractController,
      contractRepository,
      pubSubClient
    })

    apiServer = await expressEventPromiseHandler.listen(api.app, API_PORT)
  })

  afterEach(async () => {
    await httpEventPromiseHandler.close(apiServer)
  })

  it('has a health check endpoint', async () => {
    const response = await axios.get(`${API_URI}/.well-known/apollo/server-health`)
    expect(response.status).to.eq(200)
    expect(response.data).to.eql({ status: 'pass' })
  })
})
