import { boot } from '../lib'
import { ServerInfo } from 'apollo-server'
import { Server } from 'http'
import { contractServers } from '../lib/storage'
import { closeAndRemoveServer } from '../lib/servers/contract_servers'

describe('Integration Suite', () => {
  let staticApi: ServerInfo
  let proxyServer: Server

  beforeEach(async () => {
    process.env.CARDANO_API_PORT = '5001'
    process.env.CONTRACT_PROXY_PORT = '5002'
    process.env.EXECUTION_SERVICE_URI = ''
    process.env.LOWER_PORT_BOUND = '10000'
    process.env.UPPER_PORT_BOUND = '10100'

    const servers = await boot()
    staticApi = servers.staticApi
    proxyServer = servers.proxy
  })

  afterEach(async () => {
    staticApi.server.close()
    proxyServer.close()
    const contractServersInstances = contractServers.findAll()
    await Promise.all(contractServersInstances.map(s => closeAndRemoveServer(s.contractAddress)))
  })
})
